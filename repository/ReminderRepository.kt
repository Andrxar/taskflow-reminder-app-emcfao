
package com.reminderapp.repository

import android.content.Context
import com.reminderapp.data.Reminder
import com.reminderapp.data.ReminderDatabase
import com.reminderapp.services.NotificationService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ReminderRepository(private val context: Context) {
    
    private val database = ReminderDatabase.getDatabase(context)
    private val reminderDao = database.reminderDao()
    private val notificationService = NotificationService(context)
    
    fun getActiveReminders(): Flow<List<Reminder>> {
        return reminderDao.getActiveReminders()
    }
    
    fun getCompletedReminders(): Flow<List<Reminder>> {
        return reminderDao.getCompletedReminders()
    }
    
    suspend fun addReminder(title: String, description: String, dateTime: Long) {
        withContext(Dispatchers.IO) {
            try {
                println("Adding reminder: $title, $description, $dateTime")
                
                val reminder = Reminder(
                    title = title,
                    description = description,
                    dateTime = dateTime,
                    isCompleted = false,
                    isActive = true,
                    createdAt = System.currentTimeMillis(),
                    updatedAt = System.currentTimeMillis()
                )
                
                // Schedule notification
                val notificationId = notificationService.scheduleNotification(reminder)
                val reminderWithNotification = reminder.copy(notificationId = notificationId)
                
                reminderDao.insertReminder(reminderWithNotification)
                println("Reminder added successfully with notification ID: $notificationId")
            } catch (e: Exception) {
                println("Error adding reminder: ${e.message}")
                throw e
            }
        }
    }
    
    suspend fun updateReminder(reminder: Reminder) {
        withContext(Dispatchers.IO) {
            try {
                println("Updating reminder: ${reminder.id}")
                
                // Cancel old notification
                reminder.notificationId?.let { 
                    notificationService.cancelNotification(it)
                }
                
                // Schedule new notification if active and not completed
                val notificationId = if (reminder.isActive && !reminder.isCompleted) {
                    notificationService.scheduleNotification(reminder)
                } else null
                
                val updatedReminder = reminder.copy(
                    updatedAt = System.currentTimeMillis(),
                    notificationId = notificationId
                )
                
                reminderDao.updateReminder(updatedReminder)
                println("Reminder updated successfully")
            } catch (e: Exception) {
                println("Error updating reminder: ${e.message}")
                throw e
            }
        }
    }
    
    suspend fun deleteReminder(id: String) {
        withContext(Dispatchers.IO) {
            try {
                println("Deleting reminder: $id")
                
                val reminder = reminderDao.getReminderById(id)
                reminder?.notificationId?.let {
                    notificationService.cancelNotification(it)
                }
                
                reminderDao.deleteReminderById(id)
                println("Reminder deleted successfully")
            } catch (e: Exception) {
                println("Error deleting reminder: ${e.message}")
                throw e
            }
        }
    }
    
    suspend fun completeReminder(id: String) {
        withContext(Dispatchers.IO) {
            try {
                println("Completing reminder: $id")
                
                val reminder = reminderDao.getReminderById(id)
                reminder?.let {
                    // Cancel notification
                    it.notificationId?.let { notificationId ->
                        notificationService.cancelNotification(notificationId)
                    }
                    
                    val completedReminder = it.copy(
                        isCompleted = true,
                        isActive = false,
                        updatedAt = System.currentTimeMillis(),
                        notificationId = null
                    )
                    
                    reminderDao.updateReminder(completedReminder)
                    println("Reminder completed successfully")
                }
            } catch (e: Exception) {
                println("Error completing reminder: ${e.message}")
                throw e
            }
        }
    }
    
    suspend fun postponeReminder(id: String, minutes: Int) {
        withContext(Dispatchers.IO) {
            try {
                println("Postponing reminder: $id by $minutes minutes")
                
                val reminder = reminderDao.getReminderById(id)
                reminder?.let {
                    val newDateTime = it.dateTime + (minutes * 60 * 1000)
                    val postponedReminder = it.copy(
                        dateTime = newDateTime,
                        updatedAt = System.currentTimeMillis()
                    )
                    
                    updateReminder(postponedReminder)
                    println("Reminder postponed successfully")
                }
            } catch (e: Exception) {
                println("Error postponing reminder: ${e.message}")
                throw e
            }
        }
    }
}
