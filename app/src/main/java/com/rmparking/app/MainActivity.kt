package com.rmparking.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.rmparking.app.data.api.AuthApi
import com.rmparking.app.data.model.LoginRequest
import com.rmparking.app.network.ApiClient
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            ConnectionTestScreen()
        }
    }
}

@Composable
fun ConnectionTestScreen() {

    var message by remember {
        mutableStateOf("Presiona 'Probar conexión' para verificar la comunicación con NestJS")
    }

    var email by remember { mutableStateOf("admin@rmparking.com") }
    var password by remember { mutableStateOf("123456") }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Text(
            text = "RM Parking - Prueba de Conexión",
            style = MaterialTheme.typography.titleLarge
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Correo electrónico") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = {
                    scope.launch {
                        message = "Conectando con RM Parking..."
                        try {
                            val api = ApiClient.retrofit.create(AuthApi::class.java)
                            val response = api.healthCheck()
                            val body = response.string()
                            message = "Backend respondió (HTTP 200 OK): $body"
                        } catch (exception: Exception) {
                            message = "Error de conexión: ${exception.localizedMessage ?: exception.message}"
                        }
                    }
                }
            ) {
                Text("Probar conexión")
            }

            Button(
                onClick = {
                    scope.launch {
                        message = "Iniciando sesión..."
                        try {
                            val api = ApiClient.retrofit.create(AuthApi::class.java)
                            val response = api.login(LoginRequest(email = email, password = password))
                            message = "Login exitoso!\nToken: ${response.accessToken.take(20)}..."
                        } catch (exception: Exception) {
                            message = "Error en login: ${exception.localizedMessage ?: exception.message}"
                        }
                    }
                }
            ) {
                Text("Probar Login")
            }
        }
    }
}