import React, { useState, useEffect, useRef } from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import QRCodeSection from '../../components/dashboard/feedback/QRCodeSection';

const FeedbackQRPage = () => {
  usePageTitle('QR Code & Sharing');
  const { venueId } = useVenue();
  const qrCodeRef = useRef(null);
  
  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  const tabProps = {
    feedbackUrl,
    venueId,
    qrCodeRef,
  };

  if (!venueId) {
    return null;
  }

  return (
    <div className="w-full">
      <ChartCard
        title="QR Code & Sharing"
        subtitle="Generate QR codes and share feedback links with your customers"
        className="w-full"
      >
        <div className="w-full">
          <QRCodeSection feedbackUrl={feedbackUrl} venueId={venueId} />
        </div>
      </ChartCard>
    </div>
  );
};

export default FeedbackQRPage;