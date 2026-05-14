/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Аутентификация
     * Проверяет логин/пароль, создаёт сессию в Redis, устанавливает куку session_id
     * @param body login, password
     * @returns any OK
     * @throws ApiError
     */
    public static postAuthLogin(
        body: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, { // выполняем запрос к API
            method: 'POST',
            url: '/auth/login',
            body: body,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Деавторизация
     * Удаляет сессию из Redis и очищает куку
     * @returns string OK
     * @throws ApiError
     */
    public static postAuthLogout(): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
        });
    }
    /**
     * Регистрация
     * Создаёт нового пользователя с хэшированным паролем
     * @param body login, password, name, role
     * @returns any Created
     * @throws ApiError
     */
    public static postAuthRegister(
        body: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: body,
            errors: {
                400: `Bad Request`,
                409: `Conflict`,
            },
        });
    }
    /**
     * Обновить профиль
     * Изменяет имя и/или пароль текущего пользователя
     * @param body name, password
     * @returns any OK
     * @throws ApiError
     */
    public static putAuthProfile(
        body: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/auth/profile',
            body: body,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
            },
        });
    }
}
