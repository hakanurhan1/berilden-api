import * as XLSX from 'xlsx';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config'; // Yerelde çalışması için

const app = express();
app.use(cors());
app.use(express.json());

// --- SABİT USER-AGENT (KİMLİK) ---
// Tüm Trendyol isteklerinde bunu kullanacağız.
const CHROME_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// --- 1. TRENDYOL SİPARİŞLERİ ÇEKME ---
app.post('/api/trendyol-orders', async (req, res) => {
    console.log("--- TRENDYOL SİPARİŞ İSTEĞİ ---");
    
    const envCheck = {
        SellerID: process.env.TY_SELLER_ID ? "✅ VAR" : "❌ YOK",
        ApiKey: process.env.TY_API_KEY ? "✅ VAR" : "❌ YOK",
        ApiSecret: process.env.TY_SECRET ? "✅ VAR" : "❌ YOK"
    };
    console.log("Şifre Kontrolü:", envCheck);

    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;
    
    // Son 14 gün
    const startDate = Date.now() - (14 * 24 * 60 * 60 * 1000); 

    try {
        const response = await axios.get(`https://api.trendyol.com/sapigw/suppliers/${sellerId}/orders`, {
            params: { 
                startDate, 
                endDate: Date.now(), 
                orderBy: "CreatedDate", 
                orderDir: "DESC", 
                size: 50 
            },
            auth: { username: apiKey, password: apiSecret },
            headers: { 'User-Agent': CHROME_AGENT }
        });

        console.log(`✅ Siparişler Çekildi: ${response.data.content.length} adet`);
        const validOrders = response.data.content.filter(o => o.status !== "Cancelled" && o.status !== "UnSupplied");
        res.json({ success: true, data: validOrders });

    } catch (error) {
        console.error("🚨 Sipariş Hatası:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- 2. TRENDYOL ÜRÜN LİSTESİ ÇEKME (DÜZELTİLDİ) ---
app.post('/api/trendyol-products', async (req, res) => {
    console.log("--- TRENDYOL ÜRÜN İSTEĞİ ---");

    // Debug: Şifreler sunucuda var mı?
    if (!process.env.TY_SELLER_ID || !process.env.TY_API_KEY) {
        console.error("🚨 HATA: Render Environment Ayarları Eksik!");
        return res.status(500).json({ success: false, error: "API Bilgileri Girilmemiş (Render Env Kontrol Et)" });
    }

    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;
    const encodedAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios.get(`https://api.trendyol.com/sapigw/suppliers/${sellerId}/products?size=100`, {
            headers: { 
                'Authorization': `Basic ${encodedAuth}`,
                'User-Agent': CHROME_AGENT // Kilit nokta burası
            }
        });

        console.log(`✅ Ürünler Çekildi: ${response.data.content.length} adet`);
        res.json({ success: true, data: response.data.content });

    } catch (error) {
        console.error("🚨 Ürün Çekme Hatası:", error.response?.status, error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.status === 403 
                ? "403 Erişim Reddedildi. API Key hatalı veya Trendyol IP'yi engelliyor." 
                : error.message 
        });
    }
});

// --- 3. TRENDYOL FİYAT VE STOK GÜNCELLEME ---
app.post('/api/trendyol-update', async (req, res) => {
    console.log("--- TRENDYOL GÜNCELLEME İSTEĞİ ---");
    
    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;
    const encodedAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    const { barcode, price, stock } = req.body;

    const payload = {
        items: [
            {
                barcode: barcode,
                quantity: parseInt(stock),
                salePrice: parseFloat(price),
                listPrice: parseFloat(price)
            }
        ]
    };

    try {
        await axios.post(`https://api.trendyol.com/sapigw/suppliers/${sellerId}/products/price-and-inventory`, payload, {
            headers: { 
                'Authorization': `Basic ${encodedAuth}`,
                'User-Agent': CHROME_AGENT, // Buraya da ekledik
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Güncellendi: ${barcode} -> ${price}₺ / ${stock} adet`);
        res.json({ success: true, message: "Güncellendi" });

    } catch (error) {
        console.error("🚨 Güncelleme Hatası:", error.response?.data || error.message);
        res.status(500).json({ success: false, error: "Güncelleme başarısız" });
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
            headers: { 'Authorization': authHeader, 'User-Agent': CHROME_AGENT },
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
        }, { 
            headers: { 'x-api-key': apiKey, 'User-Agent': CHROME_AGENT } 
        });
        res.json({ success: true, data: response.data.orders || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- SOFTTR (EXCEL - DEDEKTİF MODU) ---
// (Frontend'de manuel yükleme kullanıyoruz ama sunucu tarafı da hazır dursun)
app.post('/api/softtr-orders', async (req, res) => {
    const excelUrl = "https://www.berildenn.com/panel/views/raporlama/siparisexcel.php?query=VFg0eHFyV2pWYkpTVENBR0RhL0lQMHhSQy82L0w1dkh0bWJrS3RyeGRGV01ZajFaT3RBYlZEaTdLaWxXdUVraUMwR25Rc1BGUGppaHc2MkpRajhVdjQrbXUyWWFxNCtDdzZuTG5qOE1UZDg3dnN5TjNLQngrZlRKVStVeW9UREc1ZWNhbmhqdFh4NGVINHVNN24zRkpnQkUwamxTbXJuOGhIcW1JdnRZaVB5OGlPVEZWWmlyKzkvekxxeW1oaGdOTkpWZjFVQkVGVW9vTFVuL01LT1gveHg5cmRrZnJyQUt2ZU96SUs0bytJTHZQVS8vU3dxdDNZWGpLQVVzS1BDS0xldTIxY2Z4UjBCRGMxb2I4Y0h0aXM5V2xHUVowMVFtQTliR1ZnYkl4SFEyYjBLRDFjNGoveXM2WDR4MVc4KzB0ODBDU1c5b3BEYmtKUkUwRVIrUzgyeFZDZERwaGpVUkk3V2hKVTRxc3RQcUxIdkxJUFVrL05WZWd0R3loMHAyQUZwandGZk0xMDh3ek1hUDhrTEp4OUJBeW1ETEZySE5CcExFZWNMaU1Ob0grUU5IOXFLVWgvVEo5VFlqYllyME5XbTVYclJSdEJMUk1uOGhUTlo4U01jK21LVUhKd2hpbFlHYjZKN0xJcjVzVjNoMGVGSCtURDNiRnFBNjVWY0RHNU4yeDNpcm9VU0poNTRxcWFmMXczakRBV0NXU1ZMU2FiM0QzU2dmaG5DODZvc252ZEo2M20zMGJZYjdHcURMb0pHUmhTbExaUmJjUXF4WDRRaGxDNDBDZUhVZEpCUVdwWmdYNnFkNTBXN0dHaEg0Znc1RDdxSG1HTDVDdjJYemxGdEE4R3hsUTJtWW9pRnVsTkU1VjRTckhMVlFoQnN2MHVIdndyNndZQXJ2VGkrTTJFdDZWTkhtYkt1dkdOY2JTUndtUG51R2FDNFRPYUI1OWJNa0Y5T3VRdlRGNHA0WmMrSzlrZnVqTDRSSXNvNXBMQzNVdjcxWTFaVWF6cnQvL3VxYU5IcmhVZ2EzWkYxbkZJUW9SdjBiUWNpRDl4OHBob21Zd285VklZbW5yano2T1ZCWW91L3B2czNYNmNpUGl4dFJxeFYvWWdneGRjYmlVa09hOUppb3FVUWtwRFNYVkI4WURyK05xUnFRUHdEV0dReU50WXY0NHBMdjRLRkZWYVhySS9rVWxyZ3FDWTlNdmdvcFg3VnltZ2pNbU1tRmJITmNMYzhnZFk0Y3QyaXo5RmNNcUg2eGpCUDRudW5tZXFiWEViZmZkR0d4OXVZdFI2aitNTGdFb2Y2RlpSNVpDek5vMERGT2V5WT0=";

    try {
        console.log("SoftTR isteği gönderiliyor...");
        const response = await axios.get(excelUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': CHROME_AGENT } // Bunu da korumalı hale getirdik
        });

        // Kontrol: Excel mi HTML mi indi?
        const firstChars = Buffer.from(response.data).toString('utf8').substring(0, 50);
        if (firstChars.includes("<!DOCTYPE html") || firstChars.includes("<html")) {
            throw new Error("Sunucu HTML gönderdi, muhtemelen engellendik.");
        }

        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        const formattedData = rawData.map(row => ({
            orderNumber: row['Sipariş No'] || row['ID'] || 'Bilinmiyor',
            customerName: row['Ad Soyad'] || row['Müşteri'] || 'Web Müşterisi',
            productName: row['Ürün'] || 'Web Siparişi',
            price: row['Tutar'] || row['Genel Toplam'] || 0,
            status: 'new',
            platform: 'Berildenn.com',
            createdAt: new Date().toISOString()
        }));

        res.json({ success: true, data: formattedData });

    } catch (error) {
        console.error("SoftTR Hatası:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Sunucu Port ${PORT} üzerinde çalışıor`));