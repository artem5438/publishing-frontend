/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { api_OrderResponse } from '../models/api_OrderResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrdersService {
    /**
     * Список заявок
     * Список без черновиков и удалённых. Создатель видит только свои заявки, модератор — все.
     * @param status Статус (formed/completed/rejected)
     * @param from Дата от (2006-01-02)
     * @param to Дата до (2006-01-02)
     * @returns api_OrderResponse OK
     * @throws ApiError
     */
    public static getPublishingOrders(
        status?: string,
        from?: string,
        to?: string,
    ): CancelablePromise<Array<api_OrderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/publishing-orders',
            query: {
                'status': status,
                'from': from,
                'to': to,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Удалить заявку
     * Логическое удаление черновика создателем
     * @param id ID заявки
     * @returns string OK
     * @throws ApiError
     */
    public static deletePublishingOrders(
        id: number,
    ): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/publishing-orders/{id}',
            path: {
                'id': id,
            },
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * Одна заявка
     * Возвращает заявку с полным списком услуг и картинками. Доступ: свой черновик; сформированные и прочие — создателю своих или модератору (чужие черновики недоступны).
     * @param id ID заявки
     * @returns api_OrderResponse OK
     * @throws ApiError
     */
    public static getPublishingOrders1(
        id: number,
    ): CancelablePromise<api_OrderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/publishing-orders/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Изменить заявку
     * Изменяет тематические поля черновика (book_title, circulation)
     * @param id ID заявки
     * @param body Поля для обновления
     * @returns api_OrderResponse OK
     * @throws ApiError
     */
    public static putPublishingOrders(
        id: number,
        body: any,
    ): CancelablePromise<api_OrderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/publishing-orders/{id}',
            path: {
                'id': id,
            },
            body: body,
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * Завершить или отклонить заявку
     * Модератор завершает (complete) или отклоняет (reject) сформированную заявку
     * @param id ID заявки
     * @param body action: complete или reject
     * @returns api_OrderResponse OK
     * @throws ApiError
     */
    public static putPublishingOrdersModerate(
        id: number,
        body: any,
    ): CancelablePromise<api_OrderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/publishing-orders/{id}/moderate',
            path: {
                'id': id,
            },
            body: body,
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * Сформировать заявку
     * Переводит черновик в статус formed. Проверяет обязательные поля и рассчитывает total_price.
     * @param id ID заявки
     * @returns api_OrderResponse OK
     * @throws ApiError
     */
    public static putPublishingOrdersSubmit(
        id: number,
    ): CancelablePromise<api_OrderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/publishing-orders/{id}/submit',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Иконка корзины
     * Возвращает id черновика и количество услуг в нём
     * @returns any OK
     * @throws ApiError
     */
    public static getPublishingOrdersCart(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/publishing-orders/cart',
        });
    }
}
