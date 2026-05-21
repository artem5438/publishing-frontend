/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrderWorksService {
    /**
     * Удалить услугу из заявки
     * Удаляет позицию из черновика (без PK м-м)
     * @param id ID заявки
     * @param workId ID услуги
     * @returns string OK
     * @throws ApiError
     */
    public static deletePublishingOrdersWorks(
        id: number,
        workId: number,
    ): CancelablePromise<Record<string, string>> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/publishing-orders/{id}/works/{workId}',
            path: {
                'id': id,
                'workId': workId,
            },
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Изменить позицию в заявке
     * Изменяет количество и комментарий позиции М-М (без PK м-м)
     * @param id ID заявки
     * @param workId ID услуги
     * @param body quantity, comment
     * @returns any OK
     * @throws ApiError
     */
    public static putPublishingOrdersWorks(
        id: number,
        workId: number,
        body: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/publishing-orders/{id}/works/{workId}',
            path: {
                'id': id,
                'workId': workId,
            },
            body: body,
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * Добавить услугу в корзину
     * Добавляет услугу в черновик. Если черновика нет — создаётся автоматически.
     * @param body work_id
     * @returns any Created
     * @throws ApiError
     */
    public static postPublishingOrdersCartWorks(
        body: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/publishing-orders/cart/works',
            body: body,
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
            },
        });
    }
}
