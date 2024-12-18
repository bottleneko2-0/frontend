// 選取整個卡片
const card = document.querySelector('.card');
// 選取亮面
const glossy = document.querySelector('.glossy');

// 最大旋轉角度
const maxRotation = 15; 
// 最大 Z 軸旋轉角度
const maxZRotation = 2; 

// 重置 旋轉角度 與 亮面透明度
function resetCardRotation() {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
    glossy.style.opacity = '0';
}

// 更新旋轉角度
function updateCardRotation(e) {
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const distanceX = mouseX - cardCenterX;
    const distanceY = mouseY - cardCenterY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const maxDistance = Math.sqrt((rect.width / 2)**2 + (rect.height / 2)**2); // 計算卡片對角線長度
    const angleX = (distanceY / maxDistance) * maxRotation;
    const angleY = -(distanceX / maxDistance) * maxRotation;
    const angleZ = (distanceX / maxDistance) * maxZRotation;
    
    card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) rotateZ(${angleZ}deg)`;
    
    // 更新 亮面透明度
    const glossyX = (mouseX - rect.left) / rect.width * 100;
    const glossyY = (mouseY - rect.top) / rect.height * 100;
    glossy.style.backgroundImage = `radial-gradient(circle at ${glossyX}% ${glossyY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 80%)`;
    glossy.style.opacity = '1';
}

// 將事件監聽器添加到卡片元素上，避免全螢幕觸發效果
card.addEventListener('mousemove', updateCardRotation);
card.addEventListener('mouseleave', resetCardRotation);