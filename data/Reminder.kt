
package com.reminderapp.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.*

@Entity(tableName = "reminders")
data class Reminder(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val description: String = "",
    val dateTime: Long, // Unix timestamp
    val isCompleted: Boolean = false,
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val notificationId: Int? = null
) {
    fun getFormattedDateTime(): String {
        val date = Date(dateTime)
        val now = Date()
        val calendar = Calendar.getInstance()
        
        calendar.time = now
        val todayStart = calendar.apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        
        val tomorrowStart = todayStart + 24 * 60 * 60 * 1000
        
        return when {
            dateTime >= todayStart && dateTime < tomorrowStart -> {
                "Сегодня в ${java.text.SimpleDateFormat("HH:mm", Locale("ru")).format(date)}"
            }
            dateTime >= tomorrowStart && dateTime < tomorrowStart + 24 * 60 * 60 * 1000 -> {
                "Завтра в ${java.text.SimpleDateFormat("HH:mm", Locale("ru")).format(date)}"
            }
            else -> {
                java.text.SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru")).format(date)
            }
        }
    }
    
    fun isOverdue(): Boolean {
        return !isCompleted && dateTime < System.currentTimeMillis()
    }
}

data class PostponeOption(
    val label: String,
    val minutes: Int
)

val POSTPONE_OPTIONS = listOf(
    PostponeOption("5 мин", 5),
    PostponeOption("10 мин", 10),
    PostponeOption("15 мин", 15),
    PostponeOption("30 мин", 30),
    PostponeOption("1 час", 60),
    PostponeOption("1 день", 1440)
)
