import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Url } from '../../types/url';
import { UrlCard } from './UrlCard';

interface UrlGridProps {
  urls: Url[];
}

export const UrlGrid: React.FC<UrlGridProps> = React.memo(({ urls }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <AnimatePresence>
      {urls.map((url) => (
        <UrlCard key={url._id} url={url} />
      ))}
    </AnimatePresence>
  </div>
));
