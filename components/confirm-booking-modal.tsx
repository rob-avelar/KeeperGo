
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  goalkeeperName?: string;
}

export function ConfirmBookingModal({
  isOpen,
  onClose,
  bookingId,
  goalkeeperName = 'Goalkeeper',
}: ConfirmBookingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [rating, setRating] = useState({
    punctuality: 0,
    attitude: 0,
    technicalSkill: 0,
  });
  const [comment, setComment] = useState('');

  const handleStarClick = (field: keyof typeof rating, value: number, maxValue: number) => {
    if (value > maxValue) return;
    setRating((prev) => ({ ...prev, [field]: value }));
  };

  const renderStars = (field: keyof typeof rating, maxStars: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(field, star, maxStars)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating[field]
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleConfirm = async () => {
    // Validate all ratings are provided
    if (rating.punctuality === 0 || rating.attitude === 0 || rating.technicalSkill === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide all ratings before confirming.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          punctuality: rating.punctuality,
          attitude: rating.attitude,
          technicalSkill: rating.technicalSkill,
          comment: comment.trim() || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      toast({
        title: 'Success!',
        description: 'Booking confirmed and payment released to goalkeeper.',
      });

      onClose();
      router.refresh();
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to confirm booking',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Goalkeeper Attendance</DialogTitle>
          <DialogDescription>
            Please rate {goalkeeperName}'s performance. This is required to release the payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Punctuality */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Punctuality (1-5 stars) <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Did the goalkeeper arrive on time?
            </p>
            {renderStars('punctuality', 5)}
          </div>

          {/* Attitude */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Attitude (1-5 stars) <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Was the goalkeeper professional and respectful?
            </p>
            {renderStars('attitude', 5)}
          </div>

          {/* Technical Skill */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Technical Skill (1-10 stars) <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              How would you rate their goalkeeping abilities?
            </p>
            {renderStars('technicalSkill', 10)}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this goalkeeper..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Confirming...' : 'Confirm & Release Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
