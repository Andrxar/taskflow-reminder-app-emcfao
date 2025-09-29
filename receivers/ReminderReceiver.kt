
package com.reminderapp.receivers

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import androidx.core.app.NotificationCompat
import com.reminderapp.MainActivity
import com.reminderapp.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class ReminderReceiver : BroadcastReceiver() {
    
    private var mediaPlayer: MediaPlayer? = null
    
    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getStringExtra("reminder_id") ?: return
        val title = intent.getStringExtra("reminder_title") ?: "Напоминание"
        val description = intent.getStringExtra("reminder_description") ?: ""
        val notificationId = intent.getIntExtra("notification_id", 0)
        
        println("Reminder notification received: $reminderId")
        
        showNotification(context, title, description, notificationId, reminderId)
        playReminderSound(context)
    }
    
    private fun showNotification(
        context: Context, 
        title: String, 
        description: String, 
        notificationId: Int,
        reminderId: String
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("reminder_id", reminderId)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Postpone actions
        val postpone5Intent = createPostponeIntent(context, reminderId, 5, notificationId + 1000)
        val postpone10Intent = createPostponeIntent(context, reminderId, 10, notificationId + 2000)
        val postpone30Intent = createPostponeIntent(context, reminderId, 30, notificationId + 3000)
        val postpone60Intent = createPostponeIntent(context, reminderId, 60, notificationId + 4000)
        
        val notification = NotificationCompat.Builder(context, "REMINDER_CHANNEL")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(description)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(0, "5 мин", postpone5Intent)
            .addAction(0, "10 мин", postpone10Intent)
            .addAction(0, "30 мин", postpone30Intent)
            .addAction(0, "1 час", postpone60Intent)
            .setFullScreenIntent(pendingIntent, true)
            .build()
        
        notificationManager.notify(notificationId, notification)
        println("Notification shown for reminder: $reminderId")
    }
    
    private fun createPostponeIntent(
        context: Context, 
        reminderId: String, 
        minutes: Int, 
        requestCode: Int
    ): PendingIntent {
        val intent = Intent(context, PostponeReceiver::class.java).apply {
            putExtra("reminder_id", reminderId)
            putExtra("postpone_minutes", minutes)
        }
        
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
    
    private fun playReminderSound(context: Context) {
        try {
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )
                setDataSource(context, Uri.parse("android.resource://${context.packageName}/${android.R.raw.notification_sound}"))
                isLooping = true
                prepare()
                start()
            }
            
            // Stop sound after 1 minute
            CoroutineScope(Dispatchers.Main).launch {
                delay(60000) // 1 minute
                mediaPlayer?.let {
                    if (it.isPlaying) {
                        it.stop()
                        it.release()
                    }
                }
                mediaPlayer = null
                println("Reminder sound stopped after 1 minute")
            }
            
            println("Reminder sound started")
        } catch (e: Exception) {
            println("Error playing reminder sound: ${e.message}")
        }
    }
}
