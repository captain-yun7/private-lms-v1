'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';

interface Device {
  id: string;
  name: string;
  fingerprint: string;
  userAgent: string | null;
  platform: string | null;
  language: string | null;
  lastUsedAt: string;
  createdAt: string;
}

export default function MyDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { fingerprint, deviceInfo } = useDeviceFingerprint();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/devices');
      const data = await response.json();

      if (response.ok) {
        setDevices(data.devices);
      } else {
        alert(data.error || '기기 목록을 불러오는데 실패했습니다');
      }
    } catch (error) {
      console.error('기기 목록 로딩 실패:', error);
      alert('기기 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async () => {
    if (!fingerprint || !deviceInfo) {
      alert('기기 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fingerprint,
          name: `${deviceInfo.platform} 기기`,
          userAgent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          language: deviceInfo.language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('기기가 등록되었습니다');
        fetchDevices();
      } else {
        alert(data.error || '기기 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('기기 등록 실패:', error);
      alert('기기 등록에 실패했습니다');
    }
  };

  const handleEditDevice = async (id: string) => {
    if (!editName.trim()) {
      alert('기기 이름을 입력해주세요');
      return;
    }

    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('기기 이름이 변경되었습니다');
        setEditingId(null);
        setEditName('');
        fetchDevices();
      } else {
        alert(data.error || '기기 수정에 실패했습니다');
      }
    } catch (error) {
      console.error('기기 수정 실패:', error);
      alert('기기 수정에 실패했습니다');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('이 기기를 삭제하시겠습니까?\n삭제 후 해당 기기에서는 강의를 시청할 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('기기가 삭제되었습니다');
        fetchDevices();
      } else {
        alert(data.error || '기기 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('기기 삭제 실패:', error);
      alert('기기 삭제에 실패했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCurrentDevice = (device: Device) => {
    return device.fingerprint === fingerprint;
  };

  const canRegisterNewDevice = devices.length < 2;
  const isDeviceRegistered = fingerprint && devices.some((d) => d.fingerprint === fingerprint);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">등록 기기 관리</h1>
            <p className="text-gray-600">
              강의 시청이 가능한 기기를 관리합니다 (최대 2개)
            </p>
          </div>

          {/* Current Device Info */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">현재 기기 정보</h3>
            {fingerprint && deviceInfo ? (
              <div className="text-sm text-blue-800 space-y-1">
                <p>플랫폼: {deviceInfo.platform}</p>
                <p>언어: {deviceInfo.language}</p>
                <p>
                  상태:{' '}
                  {isDeviceRegistered ? (
                    <span className="font-semibold text-green-700">등록됨</span>
                  ) : (
                    <span className="font-semibold text-red-700">미등록</span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-blue-800">기기 정보를 불러오는 중...</p>
            )}
          </div>

          {/* Register Button */}
          {!isDeviceRegistered && canRegisterNewDevice && (
            <div className="mb-6">
              <button
                onClick={handleRegisterDevice}
                disabled={!fingerprint}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                현재 기기 등록하기 ({devices.length}/2)
              </button>
            </div>
          )}

          {/* Device Limit Warning */}
          {!canRegisterNewDevice && !isDeviceRegistered && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                등록 가능한 기기 수를 초과했습니다. 기존 기기를 삭제한 후 새로운 기기를
                등록해주세요.
              </p>
            </div>
          )}

          {/* Device List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                등록된 기기가 없습니다
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                강의를 시청하려면 먼저 기기를 등록해주세요.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <li key={device.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === device.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded"
                              maxLength={50}
                            />
                            <button
                              onClick={() => handleEditDevice(device.id)}
                              className="text-sm text-primary hover:text-primary-dark"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditName('');
                              }}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {device.name}
                            </h3>
                            {isCurrentDevice(device) && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                현재 기기
                              </span>
                            )}
                          </div>
                        )}
                        <div className="space-y-1 text-sm text-gray-500">
                          {device.platform && <p>플랫폼: {device.platform}</p>}
                          {device.language && <p>언어: {device.language}</p>}
                          <p>마지막 사용: {formatDate(device.lastUsedAt)}</p>
                          <p>등록일: {formatDate(device.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {editingId !== device.id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(device.id);
                                setEditName(device.name);
                              }}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              이름 변경
                            </button>
                            <button
                              onClick={() => handleDeleteDevice(device.id)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notice */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">안내사항</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>최대 2개의 기기에서만 강의를 시청할 수 있습니다</li>
              <li>등록되지 않은 기기에서는 강의 시청이 제한됩니다</li>
              <li>기기를 삭제하면 즉시 해당 기기에서 시청이 불가능합니다</li>
              <li>새로운 기기를 등록하려면 기존 기기를 먼저 삭제해주세요</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
