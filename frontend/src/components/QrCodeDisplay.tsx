import QRCode from 'react-qr-code';
import Link from 'next/link';
import { useState } from 'react';

interface QrCodeDisplayProps {
  uuid: string;
  confirmStatus: '未確認' | '確認中' | '確認済み';
  csvData: Record<string, string>;
  onConfirm?: () => void;
}

export default function QrCodeDisplay({ uuid, confirmStatus, csvData, onConfirm }: QrCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const qrCodeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/qr/${uuid}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-4 bg-white rounded-lg mb-4">
        <QRCode
          value={qrCodeUrl}
          size={256}
        />
      </div>
      <p className="text-lg text-center mb-2">QRコードID: {uuid}</p>
      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
        confirmStatus === '確認済み' 
          ? 'bg-green-100 text-green-800' 
          : confirmStatus === '確認中'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
      }`}>
        {confirmStatus}
      </div>

      {/* リンクとコピーボタン */}
      <div className="mt-4 flex items-center gap-2">
        <Link 
          href={`/qr/${uuid}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          QRコードページを開く
        </Link>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          {copied ? 'コピーしました' : 'リンクをコピー'}
        </button>
      </div>

      {/* CSVデータ表示 */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded p-4 w-full">
        <h3 className="font-semibold mb-3">データ:</h3>
        <div className="space-y-2">
          {Object.entries(csvData).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium text-gray-600 dark:text-gray-400 mr-2 w-24">{key}:</span>
              <span className="text-gray-800 dark:text-gray-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 確認ボタン */}
      {confirmStatus === '未確認' && onConfirm && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            確認する
          </button>
        </div>
      )}
    </div>
  );
} 

