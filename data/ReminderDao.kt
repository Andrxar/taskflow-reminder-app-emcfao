
package com.reminderapp.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ReminderDao {
    
    @Query("SELECT * FROM reminders WHERE isActive = 1 AND isCompleted = 0 ORDER BY dateTime ASC")
    fun getActiveReminders(): Flow<List<Reminder>>
    
    @Query("SELECT * FROM reminders WHERE isCompleted = 1 ORDER BY updatedAt DESC")
    fun getCompletedReminders(): Flow<List<Reminder>>
    
    @Query("SELECT * FROM reminders WHERE id = :id")
    suspend fun getReminderById(id: String): Reminder?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: Reminder)
    
    @Update
    suspend fun updateReminder(reminder: Reminder)
    
    @Delete
    suspend fun deleteReminder(reminder: Reminder)
    
    @Query("DELETE FROM reminders WHERE id = :id")
    suspend fun deleteReminderById(id: String)
    
    @Query("SELECT * FROM reminders")
    suspend fun getAllReminders(): List<Reminder>
}
