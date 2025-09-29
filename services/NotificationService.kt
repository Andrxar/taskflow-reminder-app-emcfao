
package com.reminderapp.services

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.reminderapp.data.Reminder
import com.reminderapp.receivers.ReminderReceiver
import kotlin.random.Random

class NotificationService(private val context: Context) {
    
    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    
    fun scheduleNotification(reminder: Reminder): Int {
        return try {
            val notificationId = Random.nextInt(1000, 9999)
            
            val intent = Intent(context, ReminderReceiver::class.java).apply {
                putExtra("reminder_id", reminder.id)
                putExtra("reminder_title", reminder.title)
                putExtra("reminder_description", reminder.description)
                putExtra("notification_id", notificationId)
            }
            
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                notificationId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    reminder.dateTime,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    reminder.dateTime,
                    pendingIntent
                )
            }
            
            println("Notification scheduled for reminder ${reminder.id} at ${reminder.dateTime}")
            notificationId
        } catch (e: Exception) {
            println("Error scheduling notification: ${e.message}")
            -1
        }
    }
    
    fun cancelNotification(notificationId: Int) {
        try {
            val intent = Intent(context, ReminderReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                notificationId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            alarmManager.cancel(pendingIntent)
            println("Notification cancelled: $notificationId")
        } catch (e: Exception) {
            println("Error cancelling notification: ${e.message}")
        }
    }
}
