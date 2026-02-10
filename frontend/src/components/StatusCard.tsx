import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import type { PDFStatus } from '../types/api';

interface StatusCardProps {
  filename: string;
  status: PDFStatus;
  onStatusUpdate: (status: PDFStatus) => void;
}

const STATUS_CONFIG = {
  pending: {
    icon: Loader2,
    title: 'Processing...',
    description: 'Attempting to crack the PDF password',
    color: 'text-blue-600',
    animate: true,
  },
  cracked: {
    icon: CheckCircle2,
    title: 'Success!',
    description: 'Your PDF has been unlocked',
    color: 'text-green-600',
    animate: false,
  },
  failed: {
    icon: XCircle,
    title: 'Failed',
    description: 'Unable to crack the password',
    color: 'text-red-600',
    animate: false,
  },
};

export function StatusCard({ filename, status, onStatusUpdate }: StatusCardProps) {
  const [progress, setProgress] = useState(0);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Simulate progress for pending status
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 10;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else if (status === 'cracked') {
      setProgress(100);
    }
  }, [status]);

  // Poll for status updates
  useEffect(() => {
    if (status === 'pending') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/pdf/status/${filename}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status !== status) {
              onStatusUpdate(data.status);
            }
          }
        } catch (error) {
          console.error('Failed to fetch status:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(pollInterval);
    }
  }, [filename, status, onStatusUpdate]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon
            className={`w-6 h-6 ${config.color} ${config.animate ? 'animate-spin' : ''}`}
          />
          <div>
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">File: {filename}</p>
            {status === 'pending' && (
              <>
                <Progress value={progress} className="mb-2" />
                <p className="text-xs text-gray-500">
                  This may take a few minutes...
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
