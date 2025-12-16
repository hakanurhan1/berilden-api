import * as XLSX from 'xlsx';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// --- KAMUFLAJ BAŞLIKLARI (Browser Mimic) ---
const getHeaders = (auth) => ({
    'Authorization': `Basic ${auth}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Referer': 'https://partner.trendyol.com/',
    'Origin': 'https://partner.trendyol.com',
    'Host': 'api.trendyol.com'
});

// --- IP ADRESİ KONTROLÜ (Debug İçin) ---
const checkIP = async () => {
    try {
        const res = await axios.get('https://api.ipify.org?format=json');
        console.log("🌍 SUNUCU IP ADRESİ:", res.data.ip);
        return res.data.ip;
    } catch (e) {
        console.log("IP Kontrol Hatası:", e.message);
        return "Bilinmiyor";
    }
};

// --- TRENDYOL ÜRÜN ÇEKME ---
app.post('/api/trendyol-products', async (req, res) => {
    console.log("--- TRENDYOL ÜRÜN İSTEĞİ (STEALTH MODE) ---");
    
    // Önce IP'yi görelim (Loglara bakacağız)
    await checkIP();

    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;

    if (!sellerId || !apiKey) {
        console.error("🚨 EKSİK BİLGİ: Render Environment ayarlarını kontrol et.");
        return res.status(500).json({ success: false, error: "API Bilgileri Render'da Girilmemiş!" });
    }

    // Satıcı ID'sinin sayı olduğundan emin olalım (Bazen string boşluklu gelir)
    const cleanSellerId = sellerId.trim();
    
    // Auth String Oluştur
    const encodedAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios.get(`https://api.trendyol.com/sapigw/suppliers/${cleanSellerId}/products?size=100`, {
            headers: getHeaders(encodedAuth) // Full Kamuflaj
        });

        console.log(`✅ BAŞARILI! ${response.data.content.length} ürün çekildi.`);
        res.json({ success: true, data: response.data.content });

    } catch (error) {
        console.error("🚨 HATA DETAYI:", error.response?.status, error.response?.statusText);
        
        if (error.response?.status === 403) {
            console.error("⛔ Trendyol IP'mizi engelliyor olabilir.");
            return res.status(500).json({ 
                success: false, 
                error: `Erişim Engellendi (403). Trendyol, yurt dışı sunucusunu engelliyor olabilir. IP Kısıtlaması.` 
            });
        }

        res.status(500).json({ success: false, error: error.message });
    }
});

// --- TRENDYOL SİPARİŞ ÇEKME ---
app.post('/api/trendyol-orders', async (req, res) => {
    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;
    
    const startDate = Date.now() - (14 * 24 * 60 * 60 * 1000); 

    try {
        const response = await axios.get(`https://api.trendyol.com/sapigw/suppliers/${sellerId}/orders`, {
            params: { startDate, endDate: Date.now(), orderBy: "CreatedDate", orderDir: "DESC", size: 50 },
            auth: { username: apiKey, password: apiSecret },
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const validOrders = response.data.content.filter(o => o.status !== "Cancelled" && o.status !== "UnSupplied");
        res.json({ success: true, data: validOrders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- GÜNCELLEME ---
app.post('/api/trendyol-update', async (req, res) => {
    const sellerId = process.env.TY_SELLER_ID;
    const apiKey = process.env.TY_API_KEY;
    const apiSecret = process.env.TY_SECRET;
    const encodedAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    const { barcode, price, stock } = req.body;

    try {
        await axios.post(`https://api.trendyol.com/sapigw/suppliers/${sellerId}/products/price-and-inventory`, 
        { items: [{ barcode, quantity: parseInt(stock), salePrice: parseFloat(price), listPrice: parseFloat(price) }] }, 
        { headers: getHeaders(encodedAuth) });
        
        res.json({ success: true, message: "Güncellendi" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Güncelleme başarısız" });
    }
});

// --- SOFTTR ---
app.post('/api/softtr-orders', async (req, res) => {
    const excelUrl = "https://www.berildenn.com/panel/views/raporlama/siparisexcel.php?query=VFg0eHFyV2pWYkpTVENBR0RhL0lQMHhSQy82L0w1dkh0bWJrS3RyeGRGV01ZajFaT3RBYlZEaTdLaWxXdUVraUMwR25Rc1BGUGppaHc2MkpRajhVdjQrbXUyWWFxNCtDdzZuTG5qOE1UZDg3dnN5TjNLQngrZlRKVStVeW9UREc1ZWNhbmhqdFh4NGVINHVNN24zRkpnQkUwamxTbXJuOGhIcW1JdnRZaVB5OGlPVEZWWmlyKzkvekxxeW1oaGdOTkpWZjFVQkVGVW9vTFVuL01LT1gveHg5cmRrZnJyQUt2ZU96SUs0bytJTHZQVS8vU3dxdDNZWGpLQVVzS1BDS0xldTIxY2Z4UjBCRGMxb2I4Y0h0aXM5V2xHUVowMVFtQTliR1ZnYkl4SFEyYjBLRDFjNGoveXM2WDR4MVc4KzB0ODBDU1c5b3BEYmtKUkUwRVIrUzgyeFZDZERwaGpVUkk3V2hKVTRxc3RQcUxIdkxJUFVrL05WZWd0R3loMHAyQUZwandGZk0xMDh3ek1hUDhrTEp4OUJBeW1ETEZySE5CcExFZWNMaU1Ob0grUU5IOXFLVWgvVEo5VFlqYllyME5XbTVYclJSdEJMUk1uOGhUTlo4U01jK21LVUhKd2hpbFlHYjZKN0xJcjVzVjNoMGVGSCtURDNiRnFBNjVWY0RHNU4yeDNpcm9VU0poNTRxcWFmMXczakRBV0NXU1ZMU2FiM0QzU2dmaG5DODZvc252ZEo2M20zMGJZYjdHcURMb0pHUmhTbExaUmJjUXF4WDRRaGxDNDBDZUhVZEpCUVdwWmdYNnFkNTBXN0dHaEg0Znc1RDdxSG1HTDVDdjJYemxGdEE4R3hsUTJtWW9pRnVsTkU1VjRTckhMVlFoQnN2MHVIdndyNndZQXJ2VGkrTTJFdDZWTkhtYkt1dkdOY2JTUndtUG51R2FDNFRPYUI1OWJNa0Y5T3VRdlRGNHA0WmMrSzlrZnVqTDRSSXNvNXBMQzNVdjcxWTFaVWF6cnQvL3VxYU5IcmhVZ2EzWkYxbkZJUW9SdjBiUWNpRDl4OHBob21Zd285VklZbW5yano2T1ZCWW91L3B2czNYNmNpUGl4dFJxeFYvWWdneGRjYmlVa09hOUppb3FVUWtwRFNYVkI4WURyK05xUnFRUHdEV0dReU50WXY0NHBMdjRLRkZWYVhySS9rVWxyZ3FDWTlNdmdvcFg3VnltZ2pNbU1tRmJITmNMYzhnZFk0Y3QyaXo5RmNNcUg2eGpCUDRudW5tZXFiWEViZmZkR0d4OXVZdFI2aitNTGdFb2Y2RlpSNVpDek5vMERGT2V5WT0=";
    try {
        const response = await axios.get(excelUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
        const workbook = XLSX.read(response.data, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
        const formattedData = rawData.map(row => ({
            orderNumber: row['Sipariş No'] || row['ID'],
            customerName: row['Ad Soyad'] || row['Müşteri'],
            productName: row['Ürün'],
            price: row['Tutar'] || 0,
            status: 'new',
            platform: 'Berildenn.com',
            createdAt: new Date().toISOString()
        }));
        res.json({ success: true, data: formattedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- DİĞERLERİ (HB, Çiçeksepeti) ---
app.post('/api/hepsiburada-orders', async (req, res) => res.json({success: false, error: "Ayarlanmadı"})); // Kısa geçtim yer kaplamasın
app.post('/api/ciceksepeti-orders', async (req, res) => res.json({success: false, error: "Ayarlanmadı"}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Sunucu Port ${PORT} üzerinde çalışıyor`));