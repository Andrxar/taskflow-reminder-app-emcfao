
package com.reminderapp.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.reminderapp.repository.ReminderRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class PostponeReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getStringExtra("reminder_id") ?: return
        val postponeMinutes = intent.getIntExtra("postpone_minutes", 5)
        
        println("Postponing reminder $reminderId by $postponeMinutes minutes")
        
        val repository = ReminderRepository(context)
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                repository.postponeReminder(reminderId, postponeMinutes)
                println("Reminder postponed successfully")
            } catch (e: Exception) {
                println("Error postponing reminder: ${e.message}")
            }
        }
    }
}
