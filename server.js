// server.js - GÜVENLİ FİNAL VERSİYON
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config'; // Yerelde çalışması için

const app = express();
app.use(cors());
app.use(express.json());

// --- TRENDYOL ---
app.post('/api/trendyol-orders', async (req, res) => {
    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;
    
    // Tarih: Son 14 gün
    const startDate = Date.now() - (14 * 24 * 60 * 60 * 1000); 

    try {
        const response = await axios.get(`https://api.trendyol.com/sapigw/suppliers/${sellerId}/orders`, {
            params: { startDate, endDate: Date.now(), orderBy: "CreatedDate", orderDir: "DESC", size: 50 },
            auth: { username: apiKey, password: apiSecret }
        });
        const validOrders = response.data.content.filter(o => o.status !== "Cancelled" && o.status !== "UnSupplied");
        res.json({ success: true, data: validOrders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- HEPSİBURADA ---
app.post('/api/hepsiburada-orders', async (req, res) => {
    const merchantId = process.env.HB_MERCHANT_ID;
    const username = process.env.HB_USERNAME;
    const password = process.env.HB_PASSWORD;
    
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    try {
        const response = await axios.get(`https://oms-external.hepsiburada.com/orders/merchantid/${merchantId}`, {
            headers: { 'Authorization': authHeader },
            params: { limit: 20, offset: 0 }
        });
        res.json({ success: true, data: response.data.items || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- ÇİÇEKSEPETİ ---
app.post('/api/ciceksepeti-orders', async (req, res) => {
    const apiKey = process.env.CS_API_KEY;

    try {
        const response = await axios.post('https://apis.ciceksepeti.com/api/v1/Order/GetOrders', {
            StartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            EndDate: new Date().toISOString(),
            PageSize: 20
        }, { headers: { 'x-api-key': apiKey } });
        res.json({ success: true, data: response.data.orders || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Sunucu Çalışıyor`));