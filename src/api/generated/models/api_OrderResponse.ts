/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { api_OrderWorkResponse } from './api_OrderWorkResponse';
import type { models_OrderStatus } from './models_OrderStatus';
export type api_OrderResponse = {
    book_title?: string;
    circulation?: number;
    completed_at?: string;
    created_at?: string;
    creator_login?: string;
    /**
     * Вычисляемое поле: кол-во позиций м-м с непустым комментарием
     */
    filled_works_count?: number;
    formed_at?: string;
    id?: number;
    moderator_login?: string;
    status?: models_OrderStatus;
    total_price?: number;
    works?: Array<api_OrderWorkResponse>;
};

