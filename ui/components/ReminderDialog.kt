
package com.reminderapp.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.reminderapp.data.Reminder
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReminderDialog(
    reminder: Reminder? = null,
    onDismiss: () -> Unit,
    onSave: (String, String, Long) -> Unit
) {
    var title by remember { mutableStateOf(reminder?.title ?: "") }
    var description by remember { mutableStateOf(reminder?.description ?: "") }
    var selectedDateTime by remember { 
        mutableStateOf(
            reminder?.dateTime ?: (System.currentTimeMillis() + 3600000) // 1 hour from now
        )
    }
    
    val dateFormat = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale("ru"))
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Text(if (reminder != null) "Редактировать напоминание" else "Новое напоминание") 
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Название *") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Описание") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2
                )
                
                Text(
                    text = "Выбранное время: ${dateFormat.format(Date(selectedDateTime))}",
                    style = MaterialTheme.typography.bodyMedium
                )
                
                // Note: In a real app, you would implement proper date/time pickers here
                Text(
                    text = "Примечание: В полной версии здесь будут селекторы даты и времени",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    if (title.isNotBlank()) {
                        onSave(title.trim(), description.trim(), selectedDateTime)
                    }
                },
                enabled = title.isNotBlank()
            ) {
                Text("Сохранить")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Отмена")
            }
        }
    )
}
