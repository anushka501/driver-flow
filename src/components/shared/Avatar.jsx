import React from 'react';
import { getAvatarColor, getInitials } from '../../utils/helpers';

export default function Avatar({ name = '', size = 'sm', style = {} }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);

  const sizeStyle = size === 'lg'
    ? { width: 54, height: 54, borderRadius: 14, fontSize: 17, letterSpacing: -1 }
    : { width: 28, height: 28, borderRadius: 8, fontSize: 10 };

  return (
    <div
      className="av"
      style={{ background: color, ...sizeStyle, ...style }}
    >
      {initials}
    </div>
  );
}
