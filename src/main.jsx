import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Konsola yaşam belirtisi gönder
console.log("--> Main.jsx çalıştı! React başlatılıyor...");

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  console.error("KRİTİK HATA: 'root' elementi bulunamadı!");
  document.body.innerHTML = "<h1 style='color:red; padding:20px'>HATA: Sitede root elementi yok.</h1>";
}