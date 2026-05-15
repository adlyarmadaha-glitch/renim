import React from "react";
import { motion } from "framer-motion";

// Chibi Nezuko — karakter ikonik anime yang lucu dan dikenal luas
export default function ChibiMascot({ size = 140 }) {
  const s = size;
  const cx = s / 2;

  return (
    <svg width={s} height={s * 1.25} viewBox="0 0 140 175" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="70" cy="168" rx="30" ry="5" fill="#000" opacity="0.15"/>

      {/* Kimono body — pink/merah */}
      <rect x="30" y="90" width="80" height="58" rx="20" fill="#F87171"/>
      {/* Kimono stripe tengah */}
      <rect x="64" y="90" width="12" height="58" fill="#DC2626" opacity="0.5"/>
      {/* Kimono collar */}
      <path d="M55 90 L70 105 L85 90Z" fill="#FDE68A"/>

      {/* Kotak mulut — khas Nezuko */}
      <rect x="52" y="130" width="36" height="16" rx="6" fill="#10B981"/>
      <rect x="52" y="130" width="36" height="3" rx="1.5" fill="#059669"/>

      {/* Kaki */}
      <ellipse cx="50" cy="150" rx="12" ry="9" fill="#DC2626"/>
      <ellipse cx="90" cy="150" rx="12" ry="9" fill="#DC2626"/>
      {/* Sandal */}
      <ellipse cx="50" cy="157" rx="14" ry="7" fill="#292524"/>
      <ellipse cx="90" cy="157" rx="14" ry="7" fill="#292524"/>

      {/* Tangan kiri */}
      <ellipse cx="20" cy="110" rx="10" ry="13" fill="#F87171" transform="rotate(-8 20 110)"/>
      {/* Tangan kanan — lambaian lucu */}
      <ellipse cx="120" cy="108" rx="10" ry="13" fill="#F87171" transform="rotate(8 120 108)"/>
      {/* Jari tangan kanan */}
      <ellipse cx="128" cy="98" rx="4" ry="6" fill="#FDDBB4" transform="rotate(15 128 98)"/>
      <ellipse cx="133" cy="102" rx="4" ry="6" fill="#FDDBB4" transform="rotate(25 133 102)"/>

      {/* Kepala chibi besar */}
      <ellipse cx="70" cy="52" rx="36" ry="35" fill="#FDDBB4"/>

      {/* Telinga */}
      <ellipse cx="34" cy="52" rx="7" ry="9" fill="#FDDBB4"/>
      <ellipse cx="106" cy="52" rx="7" ry="9" fill="#FDDBB4"/>
      <ellipse cx="34" cy="52" rx="4" ry="5.5" fill="#FCA5A5"/>
      <ellipse cx="106" cy="52" rx="4" ry="5.5" fill="#FCA5A5"/>

      {/* Rambut — hitam panjang Nezuko */}
      <path d="M34 36 Q36 12 70 10 Q104 12 106 36 Q94 20 70 18 Q46 20 34 36Z" fill="#1C0A00"/>
      {/* Rambut sisi */}
      <path d="M34 34 Q26 50 30 60 Q36 46 38 35Z" fill="#1C0A00"/>
      <path d="M106 34 Q114 50 110 60 Q104 46 102 35Z" fill="#1C0A00"/>
      {/* Pita rambut merah */}
      <rect x="55" y="8" width="30" height="10" rx="5" fill="#DC2626"/>
      <rect x="65" y="4" width="10" height="18" rx="4" fill="#DC2626"/>
      <circle cx="70" cy="13" r="4" fill="#FCA5A5"/>

      {/* Mata — besar, merah muda / mauve Nezuko */}
      <ellipse cx="54" cy="53" rx="10" ry="11" fill="white"/>
      <ellipse cx="86" cy="53" rx="10" ry="11" fill="white"/>
      {/* Iris merah muda */}
      <ellipse cx="54" cy="54" rx="7.5" ry="8.5" fill="#F9A8D4"/>
      <ellipse cx="86" cy="54" rx="7.5" ry="8.5" fill="#F9A8D4"/>
      {/* Pupil */}
      <circle cx="54" cy="55" r="4" fill="#7C1D2C"/>
      <circle cx="86" cy="55" r="4" fill="#7C1D2C"/>
      {/* Kilau */}
      <circle cx="56" cy="51" r="2.5" fill="white"/>
      <circle cx="88" cy="51" r="2.5" fill="white"/>
      <circle cx="52" cy="57" r="1" fill="white" opacity="0.7"/>
      <circle cx="84" cy="57" r="1" fill="white" opacity="0.7"/>
      {/* Bulu mata */}
      <path d="M44 45 Q54 41 64 45" stroke="#1C0A00" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M76 45 Q86 41 96 45" stroke="#1C0A00" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Hidung */}
      <ellipse cx="70" cy="63" rx="2" ry="1.5" fill="#E8A87C"/>

      {/* Ekspresi — mata setengah tutup lucu (efek block mulut Nezuko) */}
      <path d="M60 70 Q70 72 80 70" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Pipi merah uwu */}
      <ellipse cx="40" cy="64" rx="9" ry="6" fill="#FCA5A5" opacity="0.6"/>
      <ellipse cx="100" cy="64" rx="9" ry="6" fill="#FCA5A5" opacity="0.6"/>

      {/* Motif hana (bunga) di kimono */}
      <circle cx="46" cy="108" r="5" fill="#FDE68A" opacity="0.7"/>
      <circle cx="46" cy="108" r="2" fill="#F59E0B"/>
      <circle cx="94" cy="108" r="5" fill="#FDE68A" opacity="0.7"/>
      <circle cx="94" cy="108" r="2" fill="#F59E0B"/>
    </svg>
  );
}