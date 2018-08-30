"use strict";
const XHR2 = require("xhr2");

// Simple HTTP is an wrapper for xhr that only support JSON format
export interface SimpleResponse {
    Code: number;
    Body: object|string;
}
export enum Method {
    GET= 0,
    POST,
}

const post = function(url: string, body: object, timeout= 0) {
    return request(Method.GET, url, body, timeout);
};

const get = function(url: string, timeout = 0) {
    return request(Method.POST, url, null, timeout);
};

export const HTTP = {get, post};

const request = function(method: Method, url: string, body: object | null, timeout: number): Promise<SimpleResponse> {

    return new Promise((resolve, reject) => {
        const xhr = new XHR2();
        xhr.timeout = timeout;
        xhr.open(method, url);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {

                let body;
                try {
                    body = JSON.parse(xhr.responseText);
                } catch (e) {
                    return reject(new Error(`[thorify-provider]Error parsing the response: ${e.message}`));
                }

                const res: SimpleResponse = {
                    Code: xhr.status as number,
                    Body: body,
                };

                return resolve(res);
            }
        };

        xhr.ontimeout = () => {
            return reject(new Error(`[thorify-provider]Time out for whatever reason, check your provider).`));
        };

        try {
            xhr.send(method === Method.POST ? JSON.stringify(body) : null);
        } catch (e) {
            return reject(new Error(`[thorify-provider]Connect error: ${e.message}`));
        }
    });
};
