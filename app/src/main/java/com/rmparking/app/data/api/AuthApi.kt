package com.rmparking.app.data.api

import com.rmparking.app.data.model.LoginRequest
import com.rmparking.app.data.model.LoginResponse
import com.rmparking.app.data.model.User
import okhttp3.ResponseBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthApi {

    @GET("/")
    suspend fun healthCheck(): ResponseBody

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): LoginResponse

    @GET("auth/me")
    suspend fun getCurrentUser(
        @Header("Authorization") token: String
    ): User

    @POST("auth/logout")
    suspend fun logout(
        @Header("Authorization") token: String
    ): ResponseBody
}