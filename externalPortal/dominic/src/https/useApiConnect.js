import axios from 'axios';

const API_URL = "https://b2e6csmvro6yqffds3rxunkihu0dzkjk.lambda-url.ap-northeast-1.on.aws/";

// 401 レスポンス時のトークン期限切れ処理
axios.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            window.dispatchEvent(new CustomEvent('auth:token-expired'));
        }
        return Promise.reject(err);
    }
);

/**
 * Lambda へ POST リクエストを送る汎用関数
 * @param {string} type  - ルーティングキー (例: 'auth/login')
 * @param {object} data  - 送信データ
 */
export async function apiPost(type, data) {
    const response = await axios.post(API_URL, { type, data });
    return response.data;
}
