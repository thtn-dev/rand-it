"use client";
import WheelGame from "@/components/common/wheel-game";

function SpinWheelGamePage() {
  const items = [
    "iPhone 13",
    "Macbook Pro",
    "AirPods Pro",
    "Apple Watch",
    "iPhone 12",
    "Cái nịt",
  ];

  const handleSelectedItem = (item: string) => {
    alert(`Chúc mừng Quỳnh Thương đã trúng ${item}`);
  };

  return (
    <div>
      <h2>Vòng quay may mắn</h2>
      <WheelGame items={items} onSelectItem={handleSelectedItem} />
    </div>
  );
}

export default SpinWheelGamePage;
