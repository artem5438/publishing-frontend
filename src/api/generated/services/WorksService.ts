/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { api_WorkResponse } from '../models/api_WorkResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorksService {
    /**
     * Список услуг
     * Возвращает активные услуги. Поддерживает фильтры. Без фильтров кешируется в Redis 60s.
     * @param query Поиск по названию
     * @param minPrice Минимальная цена
     * @param maxPrice Максимальная цена
     * @param workType Тип работы
     * @returns api_WorkResponse OK
     * @throws ApiError
     */
    public static getWorks(
        query?: string,
        minPrice?: number,
        maxPrice?: number,
        workType?: string,
    ): CancelablePromise<Array<api_WorkResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/works',
            query: {
                'query': query,
                'minPrice': minPrice,
                'maxPrice': maxPrice,
                'workType': workType,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Создать услугу
     * Создаёт новую услугу. Принимает multipart/form-data с файлами image и video.
     * @param name Название
     * @param priceRub Цена в рублях
     * @param description Описание
     * @param workType Тип работы
     * @param unit Единица
     * @param paramDeadline Срок
     * @param paramQuantity Количество
     * @param paramUnit Единица параметра
     * @param paramFormat Формат
     * @param tag1 Тег 1
     * @param tag2 Тег 2
     * @param tag3 Тег 3
     * @param image Изображение
     * @param video Видео
     * @returns api_WorkResponse Created
     * @throws ApiError
     */
    public static postWorks(
        name: string,
        priceRub: number,
        description?: string,
        workType?: string,
        unit?: string,
        paramDeadline?: string,
        paramQuantity?: string,
        paramUnit?: string,
        paramFormat?: string,
        tag1?: string,
        tag2?: string,
        tag3?: string,
        image?: Blob,
        video?: Blob,
    ): CancelablePromise<api_WorkResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/works',
            formData: {
                'name': name,
                'price_rub': priceRub,
                'description': description,
                'work_type': workType,
                'unit': unit,
                'param_deadline': paramDeadline,
                'param_quantity': paramQuantity,
                'param_unit': paramUnit,
                'param_format': paramFormat,
                'tag1': tag1,
                'tag2': tag2,
                'tag3': tag3,
                'image': image,
                'video': video,
            },
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * Одна услуга
     * Возвращает услугу по ID
     * @param id ID услуги
     * @returns api_WorkResponse OK
     * @throws ApiError
     */
    public static getWorks1(
        id: number,
    ): CancelablePromise<api_WorkResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/works/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
            },
        });
    }
}
