// ==========================================
// TỔNG HỢP JAVASCRIPT CHO WEBSITE MENZZO
// ==========================================

// 1. CẬP NHẬT SỐ LƯỢNG TRÊN BIỂU TƯỢNG GIỎ HÀNG
function updateCartCount() {
    let cartCount = document.querySelector(".cart-count");
    if (!cartCount) return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;
    // Tính tổng số lượng thay vì đếm số dòng
    cart.forEach(item => total += item.quantity);
    cartCount.innerText = total;
}

// 2. PHÂN LOẠI TÀI KHOẢN TRÊN MENU (NAVBAR) VÀ XỬ LÝ ICON USER
function handleNavbarAuth() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const menu = document.querySelector(".menu");
    
    // Tìm thẻ <a> đang bọc icon user ở góc phải
    const iconContainer = document.querySelector(".icons");
    let userIconLink = null;
    if (iconContainer) {
        userIconLink = iconContainer.querySelector("a[href='login.html']");
    }

    if (currentUser) {
        // --- XỬ LÝ CHỮ TRÊN THANH MENU ---
        if (menu) {
            const menuLinks = Array.from(menu.querySelectorAll("a"));
            const loginLink = menuLinks.find(a => a.getAttribute("href") === "login.html" || a.innerText.includes("Đăng nhập"));
            if (loginLink && loginLink.parentElement) {
                loginLink.parentElement.remove();
            }

            if (currentUser.role === "admin") {
                menu.innerHTML += `
                    <li><a href="#" style="color: #ff4757; font-weight: bold;"><i class="fa-solid fa-user-gear"></i> Quản lý trang</a></li>
                    <li><a href="#" class="logout-btn" style="color: #ccc;"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a></li>
                `;
            } else {
                menu.innerHTML += `
                    <li><a href="#" style="color: #C5A059;"><i class="fa-solid fa-user"></i> Chào, ${currentUser.name}</a></li>
                    <li><a href="#" class="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a></li>
                `;
            }

            // Gắn sự kiện cho nút "Đăng xuất" trên menu
            document.querySelectorAll(".logout-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("currentUser");
                    alert("Bạn đã đăng xuất thành công!");
                    window.location.href = "index.html";
                });
            });
        }

        // --- XỬ LÝ ICON HÌNH NGƯỜI Ở GÓC PHẢI ---
        if (userIconLink) {
            // 1. Đổi link để bấm vào không bị nhảy sang trang login nữa
            userIconLink.href = "#";
            
            // 2. Đổi icon từ viền mỏng sang in đậm và có dấu tick để biểu thị đã đăng nhập
            userIconLink.innerHTML = '<i class="fa-solid fa-user-check" style="color: #C5A059;"></i>';
            userIconLink.title = "Đăng xuất tài khoản"; // Hiện chữ gợi ý khi di chuột vào

            // 3. Khi bấm vào icon này cũng sẽ hỏi Đăng xuất
            userIconLink.addEventListener("click", (e) => {
                e.preventDefault();
                if(confirm("Bạn có muốn đăng xuất tài khoản không?")) {
                    localStorage.removeItem("currentUser");
                    window.location.href = "index.html"; // Tải lại trang chủ
                }
            });
        }
    }
}

// 3. TÍNH NĂNG ĐĂNG KÝ TÀI KHOẢN
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const agree = document.getElementById("agree").checked;

        if (!name || !email || !password) return alert("Vui lòng nhập đầy đủ thông tin!");
        if (password !== confirmPassword) return alert("Mật khẩu xác nhận không khớp!");
        if (!agree) return alert("Vui lòng đồng ý với điều khoản sử dụng!");

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some(u => u.email === email)) return alert("Email này đã được đăng ký!");

        users.push({ name, email, password, role: "customer" });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Đăng ký thành công!");
        window.location.href = "login.html";
    });
}

// 4. TÍNH NĂNG ĐĂNG NHẬP
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        if (!email || !password) return alert("Vui lòng nhập đầy đủ thông tin!");

        if (email === "admin@menzzo.vn" && password === "admin123") {
            localStorage.setItem("currentUser", JSON.stringify({ name: "Quản trị viên", email, role: "admin" }));
            alert("Đăng nhập tài khoản QUẢN TRỊ thành công!");
            return window.location.href = "index.html";
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
            localStorage.setItem("currentUser", JSON.stringify({ name: foundUser.name, email: foundUser.email, role: foundUser.role }));
            alert(`Chào mừng ${foundUser.name} quay trở lại!`);
            window.location.href = "index.html";
        } else {
            alert("Email hoặc mật khẩu không chính xác!");
        }
    });
}

// =========================
// 5. ĐỒNG BỘ TRÁI TIM YÊU THÍCH (CÁ NHÂN HÓA THEO USER)
// =========================
function syncFavoriteButtons() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    //Nếu chưa đăng nhập -> mảng yêu thích mặc định rỗng để ẩn tim đỏ
    let favorites = [];
    if (currentUser) {
        const favKey = "favorites_" + currentUser.email;
        favorites = JSON.parse(localStorage.getItem(favKey)) || [];
    }

    const items = document.querySelectorAll(".product-card, .product-detail");
    
    items.forEach(item => {
        const loveBtn = item.querySelector(".love-btn");
        if (!loveBtn) return;

        let productName = "";
        if (item.classList.contains("product-detail")) {
            const h2 = item.querySelector("h2");
            if (h2) productName = h2.innerText.trim();
        } else {
            const h3 = item.querySelector("h3");
            if (h3) productName = h3.innerText.trim();
        }

        if (!productName) return;

        // Chỉ tô đỏ trái tim khi có người dùng đăng nhập và sản phẩm đó nằm trong kho của họ
        if (currentUser && favorites.some(p => p.name === productName)) {
            loveBtn.classList.add("active");
            loveBtn.innerHTML = "❤";
            loveBtn.style.color = "#87CEEB";
        } else {
            loveBtn.classList.remove("active");
            loveBtn.innerHTML = "♡";
            loveBtn.style.color = "";
        }
    });
}

// Xử lý khi nhấn nút trái tim
function initFavoriteButtons() {
    document.querySelectorAll(".love-btn").forEach(button => {
        if(button.classList.contains("delete-btn")) return; // Bỏ qua nút xóa trong giỏ hàng

        button.addEventListener("click", (e) => {
            e.preventDefault();
            
            // KIỂM TRA ĐĂNG NHẬP
            const currentUser = JSON.parse(localStorage.getItem("currentUser"));
            if (!currentUser) {
                alert("Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
                window.location.href = "login.html"; 
                return; 
            }

            const card = button.closest(".product-card") || button.closest(".product-detail");
            if (!card) return;

            let productName = "";
            if (card.classList.contains("product-detail")) {
                const h2 = card.querySelector("h2");
                if (h2) productName = h2.innerText.trim();
            } else {
                const h3 = card.querySelector("h3");
                if (h3) productName = h3.innerText.trim();
            }

            const priceEl = card.querySelector(".price");
            const imgEl = card.querySelector("img");
            if (!productName || !priceEl) return;

            // ĐÃ SỬA: Lưu danh sách yêu thích riêng biệt gắn liền với Email của User
            const favKey = "favorites_" + currentUser.email;
            let favorites = JSON.parse(localStorage.getItem(favKey)) || [];
            const isExist = favorites.some(p => p.name === productName);

            if (!isExist) {
                favorites.push({ name: productName, price: priceEl.innerText.trim(), image: imgEl ? imgEl.src : "" });
                alert("Đã thêm vào danh sách yêu thích!");
            } else {
                favorites = favorites.filter(p => p.name !== productName);
                alert("Đã xóa khỏi danh sách yêu thích!");
            }
            
            localStorage.setItem(favKey, JSON.stringify(favorites));
            syncFavoriteButtons();
            if (window.location.pathname.includes("favorite.html")) renderFavoritePage();
        });
    });
}

// Hiển thị trang yêu thích động
function renderFavoritePage() {
    const grid = document.querySelector(".favorite-layout-grid");
    const emptyMsg = document.getElementById("favorite-empty-msg");
    if (!grid) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    // Nếu không có ai đăng nhập, ép trang sản phẩm yêu thích hiển thị trạng thái trống
    if (!currentUser) {
        grid.innerHTML = "";
        if (emptyMsg) emptyMsg.style.display = "block";
        return;
    }

    const favKey = "favorites_" + currentUser.email;
    let favorites = JSON.parse(localStorage.getItem(favKey)) || [];
    
    if (favorites.length === 0) {
        grid.innerHTML = "";
        if (emptyMsg) emptyMsg.style.display = "block";
    } else {
        if (emptyMsg) emptyMsg.style.display = "none";
        grid.innerHTML = favorites.map(p => `
            <div class="product-card">
                <img src="${p.image}" alt="Product">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="price">${p.price}</div>
                    <div class="product-actions">
                        <a href="product-detail.html"><button class="cart-btn">Xem chi tiết</button></a>
                        <button class="love-btn active" style="color: #87CEEB;">❤</button>
                    </div>
                </div>
            </div>
        `).join("");
        initFavoriteButtons(); // Gán lại sự kiện xóa động
    }
}

// 6. THÊM SẢN PHẨM VÀO GIỎ HÀNG
function initAddToCart() {
    document.querySelectorAll(".cart-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            if (button.innerText.toUpperCase().includes("XEM CHI TIẾT")) return;
            e.preventDefault();

            const card = button.closest(".product-card") || button.closest(".product-detail");
            if (!card) return;

            // ĐÃ SỬA LỖI: Phân loại rõ ràng cách lấy tên sản phẩm
            let productName = "";
            if (card.classList.contains("product-detail")) {
                // Nếu đang đứng ở trang Chi tiết sản phẩm -> Lấy thẻ h2
                productName = card.querySelector("h2").innerText.trim();
            } else {
                // Nếu đang đứng ở trang chủ hoặc danh mục -> Lấy thẻ h3
                productName = card.querySelector("h3").innerText.trim();
            }

            const productPrice = card.querySelector(".price").innerText.trim();
            const productImage = card.querySelector("img").src;

            // Kiểm tra xem có chỉnh số lượng ở trang chi tiết không
            let quantity = 1;
            const qtySpan = card.querySelector(".quantity-number");
            if (qtySpan && !card.closest("#cart-items-container")) {
                quantity = parseInt(qtySpan.innerText) || 1;
            }

            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const exist = cart.find(p => p.name === productName);

            if (exist) {
                exist.quantity += quantity;
            } else {
                cart.push({ name: productName, price: productPrice, image: productImage, quantity });
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            alert("Đã thêm vào giỏ hàng!");
        });
    });
}

// 7. HIỂN THỊ VÀ XỬ LÝ TRANG GIỎ HÀNG
function renderCartPage() {
    const container = document.getElementById("cart-items-container");
    const totalEl = document.getElementById("cart-total-price");
    if (!container || !totalEl) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding: 40px; font-size:18px;'>Giỏ hàng trống.</p>";
        totalEl.innerText = "0đ";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        const price = parseInt(item.price.replace(/\D/g, ''));
        total += price * item.quantity;
        return `
        <div class="cart-item">
            <div class="cart-product">
                <img src="${item.image}" alt="Product">
                <div><h3>${item.name}</h3></div>
            </div>
            <div class="quantity">
                <button class="minus-btn" data-index="${index}">-</button>
                <span class="quantity-number">${item.quantity}</span>
                <button class="plus-btn" data-index="${index}">+</button>
            </div>
            <div class="price">${(price * item.quantity).toLocaleString('vi-VN')}đ</div>
            <button class="love-btn delete-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
        </div>
        `;
    }).join("");
    
    totalEl.innerText = total.toLocaleString('vi-VN') + "đ";

    // Gán sự kiện cho các nút trong giỏ
    container.querySelectorAll(".plus-btn").forEach(btn => btn.addEventListener("click", () => {
        cart[btn.dataset.index].quantity++;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartPage(); updateCartCount();
    }));
    container.querySelectorAll(".minus-btn").forEach(btn => btn.addEventListener("click", () => {
        if (cart[btn.dataset.index].quantity > 1) cart[btn.dataset.index].quantity--;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartPage(); updateCartCount();
    }));
    container.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", () => {
        cart.splice(btn.dataset.index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartPage(); updateCartCount();
    }));
}

// 8. HIỂN THỊ TRANG THANH TOÁN
function renderCheckoutPage() {
    const container = document.getElementById("checkout-items-container");
    if (!container) return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = 0;

    container.innerHTML = cart.map(item => {
        const price = parseInt(item.price.replace(/\D/g, ''));
        subtotal += price * item.quantity;
        return `
        <div class="cart-item" style="padding: 15px 0;">
            <div class="cart-product">
                <img src="${item.image}" alt="Product" style="width:60px; height:70px;">
                <div><h3 style="font-size:15px;">${item.name}</h3><p style="font-size:13px;">SL: ${item.quantity}</p></div>
            </div>
            <div style="font-weight:bold; color:#C5A059;">${(price * item.quantity).toLocaleString('vi-VN')}đ</div>
        </div>`;
    }).join("");

    document.getElementById("checkout-subtotal").innerText = subtotal.toLocaleString('vi-VN') + "đ";
    document.getElementById("checkout-total").innerText = (subtotal > 0 ? subtotal + 30000 : 0).toLocaleString('vi-VN') + "đ";
}

// Thanh toán thành công
const checkoutForm = document.querySelector(".checkout-form form");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Đặt hàng thành công! Cảm ơn bạn.");
        localStorage.removeItem("cart");
        window.location.href = "index.html";
    });
}

// 9. NÚT TĂNG GIẢM SỐ LƯỢNG (Dành riêng cho trang Chi tiết sản phẩm)
function initQtyButtons() {
    document.querySelectorAll(".plus-btn, .minus-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            if(btn.closest("#cart-items-container")) return; // Bỏ qua nếu là nút trong giỏ hàng
            const numEl = btn.parentElement.querySelector(".quantity-number");
            if(!numEl) return;
            let val = parseInt(numEl.innerText) || 1;
            if(btn.classList.contains("plus-btn")) val++;
            else if(val > 1) val--;
            numEl.innerText = val;
        });
    });
}

// Nút chọn size
document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.parentElement.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// Cuộn trang đổi màu Header
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if(header) header.style.background = window.scrollY > 50 ? "#08131F" : "#0D1B2A";
});

// =========================
// 10. CHỨC NĂNG TÌM KIẾM SẢN PHẨM (LIVE SEARCH)
// =========================
function initSearch() {
    const searchIcon = document.querySelector(".fa-magnifying-glass");
    if (!searchIcon) return;

    searchIcon.addEventListener("click", (e) => {
        e.preventDefault();
        
        // 1. Hiển thị hộp thoại yêu cầu người dùng nhập từ khóa
        const keyword = prompt("🔍 Nhập tên sản phẩm bạn muốn tìm kiếm (VD: Bomber, Polo, Jean...):");
        
        // 2. Nếu người dùng bấm Hủy (Cancel) hoặc để trống thì thoát hàm
        if (keyword === null || keyword.trim() === "") return;
        
        const searchTerm = keyword.trim().toLowerCase();
        const productCards = document.querySelectorAll(".product-card");

        // 3. Xử lý trường hợp đang ở trang không có sẵn danh sách sản phẩm (VD: Giỏ hàng, Đăng nhập)
        if (productCards.length === 0) {
            alert("Trang hiện tại không có sản phẩm. Hệ thống sẽ chuyển sang trang Danh mục!");
            window.location.href = "category.html";
            return;
        }

        // 4. Tiến hành lọc trực tiếp trên các sản phẩm đang hiển thị ở trang hiện tại
        let foundCount = 0;

        productCards.forEach(card => {
            const h3 = card.querySelector("h3");
            if (!h3) return;
            
            const productName = h3.innerText.toLowerCase();
            
            // Kiểm tra xem tên sản phẩm có chứa từ khóa nhập vào không
            if (productName.includes(searchTerm)) {
                card.style.display = "block"; // Giữ lại sản phẩm khớp
                foundCount++;
            } else {
                card.style.display = "none"; // Ẩn đi sản phẩm không khớp
            }
        });

        // 5. Hiển thị kết quả cho người dùng
        if (foundCount === 0) {
            alert(`Không tìm thấy sản phẩm nào phù hợp với từ khóa: "${keyword}"`);
            // Hiển thị lại tất cả sản phẩm nếu tìm không thấy để giao diện không bị trống
            productCards.forEach(card => card.style.display = "block"); 
        } else {
            // Cuộn màn hình tự động xuống khu vực chứa sản phẩm
            const productsSection = document.querySelector(".products") || document.querySelector(".category-layout");
            if (productsSection) {
                window.scrollTo({
                    top: productsSection.offsetTop - 100,
                    behavior: "smooth"
                });
            }
        }
    });
}

// =========================
// 11. KHO DỮ LIỆU VÀ XỬ LÝ TRANG CHI TIẾT SẢN PHẨM ĐỘNG
// =========================

// 1. KHO DỮ LIỆU MÔ TẢ
const productDatabase = {
    "Áo Khoác Bomber Premium": {
        shortDesc: [
            "Áo khoác bomber phong cách hiện đại, chất liệu cao cấp, thiết kế tối giản phù hợp với phong cách quý ông đương đại.",
            "Chất liệu mềm mại, thoáng khí, đường may chắc chắn và form chuẩn giúp tạo cảm giác sang trọng khi sử dụng."
        ],
        longDesc: [
            "Sản phẩm được thiết kế theo phong cách tối giản hiện đại, mang đến vẻ ngoài lịch lãm và nam tính cho người mặc.",
            "Chất liệu vải cao cấp giúp giữ form, hạn chế nhăn tối đa và tạo cảm giác vô cùng thoải mái khi vận động.",
            "Phù hợp cho nhiều hoàn cảnh khác nhau: đi làm văn phòng, đi chơi dạo phố hoặc tham dự các sự kiện quan trọng."
        ]
    },
    "Áo Polo Basic": {
        shortDesc: [
            "Áo polo chất liệu cotton tự nhiên co giãn 4 chiều, thấm hút mồ hôi cực tốt đem lại cảm giác thoáng mát cả ngày.",
            "Form dáng vừa vặn tôn đường nét nam tính, cổ áo dệt bo cứng cáp không bị mất form sau nhiều lần giặt."
        ],
        longDesc: [
            "Dòng sản phẩm Polo Basic thế hệ mới của MENZZO mang lại sự thoải mái tối đa cho ngày dài năng động nhờ công nghệ dệt sợi thông minh.",
            "Bảng màu trung tính thời thượng, cực kỳ dễ dàng phối hợp cùng quần tây lịch lãm, quần jean bụi bặm hoặc quần short năng động.",
            "Là lựa chọn hoàn hảo cho tủ đồ hằng ngày: mặc đi làm thanh lịch, đi cà phê cùng bạn bè hoặc tham gia các hoạt động thể thao nhẹ ngoài trời."
        ]
    },
    "Quần Tây Slimfit": {
        shortDesc: [
            "Quần tây công sở form dáng Slimfit trẻ trung, ôm nhẹ tôn chiều cao và tạo hiệu ứng chân thẳng gọn gàng.",
            "Chất vải tuyết mưa cao cấp có độ co giãn nhẹ, bề mặt vải đanh mịn, không bám bụi và không xù lông."
        ],
        longDesc: [
            "Quần Tây Slimfit MENZZO là sự giao thoa hoàn hảo giữa nét cổ điển và tinh thần hiện đại, chú trọng vào từng đường cắt may chuẩn xác.",
            "Thiết kế con đỉa quần và túi sau tinh tế, dễ dàng sơ vin cùng áo sơ mi hoặc kết hợp phá cách cùng áo polo, áo thun.",
            "Thích hợp cho môi trường công sở lịch sự, các buổi gặp gỡ đối tác trang trọng hoặc các dịp lễ tiệc cuối năm."
        ]
    },
    "Áo Sơ Mi Premium": {
        shortDesc: [
            "Áo sơ mi dài tay chất liệu vải sợi tre (Bamboo) tự nhiên, có khả năng kháng khuẩn và chống nhăn tự động vượt trội.",
            "Bề mặt vải mượt mà, có độ bóng nhẹ sang trọng, mang lại cảm giác mát lạnh ngay khi chạm vào da."
        ],
        longDesc: [
            "Sơ Mi Premium tự hào là dòng sản phẩm cao cấp phân khúc văn phòng, mang lại diện mạo chỉn chu tuyệt đối cho các quý ông.",
            "Đường may tinh xảo cuộn biên tỉ mỉ, cổ áo cứng cáp hỗ trợ thắt cà vạt đứng form hoàn hảo không bị gãy gập.",
            "Phù hợp mặc trong các cuộc họp quan trọng, sự kiện trang trọng hoặc phối cùng suit/vest thượng lưu."
        ]
    },
    "Bomber Luxury": {
        shortDesc: [
            "Phiên bản giới hạn với chất liệu vải dù cán mờ chống nước nhẹ, phối bo chun dày dặn độc quyền.",
            "Thiết kế túi khóa zip kim loại tráng bạc cao cấp, tạo điểm nhấn cá tính và thời thượng cho tổng thể trang phục."
        ],
        longDesc: [
            "Dòng Bomber Luxury hướng đến những chàng trai yêu thích sự phá cách nhưng vẫn giữ được tinh thần sang trọng, đẳng cấp.",
            "Lớp lót bên trong bằng lụa satin mềm mại, vừa giữ nhiệt tốt vừa đảm bảo độ thông thoáng tối đa khi thời tiết thay đổi.",
            "Một item điểm nhấn xuất sắc cho các buổi tiệc tối, đi club hoặc dạo phố đêm mùa đông."
        ]
    },
    "Quần Jean Slimfit": {
        shortDesc: [
            "Quần jean chất liệu denim cotton dày dặn phối sợi co giãn, không bị phai màu hay giãn chảy sau thời gian dài sử dụng.",
            "Màu sắc wash nhẹ tạo hiệu ứng bụi bặm vừa phải, form dáng ôm gọn đùi xuôi xuống ống quần vô cùng tôn dáng."
        ],
        longDesc: [
            "Quần Jean Slimfit là biểu tượng của sự phóng khoáng và đa dụng, được xử lý bề mặt mềm mại không gây thô ráp khi mặc.",
            "Các chi tiết đinh tán kim loại và mác da phía sau cạp quần được gia công sắc nét, khẳng định chất lượng cao cấp.",
            "Cực kỳ dễ phối đồ, từ một chiếc áo thun đơn giản đến áo khoác da chất lừ cho những chuyến đi phượt hoặc tụ tập cuối tuần."
        ]
    },
    "Áo Polo Luxury": {
        shortDesc: [
            "Sự kết hợp đỉnh cao giữa sợi Cotton Mercerized (gỗ tự nhiên) mang lại độ bóng bẩy sang trọng và bền bỉ tối đa.",
            "Họa tiết dệt chìm tinh tế ở cổ áo và tay áo, khẳng định gu thẩm mỹ tinh tế của người mặc."
        ],
        longDesc: [
            "Polo Luxury là biểu tượng của phong cách 'Quiet Luxury' - sang trọng thầm lặng, không phô trương nhưng vô cùng đẳng cấp.",
            "Chất vải siêu mềm, nhẹ như mây, có khả năng điều hòa thân nhiệt cực tốt theo thời tiết.",
            "Rất thích hợp cho những buổi chơi Golf, nghỉ dưỡng resort cao cấp hoặc gặp gỡ đối tác trong không gian sang trọng."
        ]
    },
    "Sơ Mi Modern Fit": {
        shortDesc: [
            "Kiểu dáng Modern Fit suông nhẹ hiện đại, mang lại sự thoải mái tuyệt đối cho những người không thích mặc quá ôm.",
            "Chất liệu vải may từ sợi tổng hợp thế mới nhẹ, nhanh khô và hầu như không cần là ủi sau khi giặt."
        ],
        longDesc: [
            "Sơ Mi Modern Fit phá vỡ định kiến về chiếc áo sơ mi gò bó, mang lại tinh thần tự do, phóng khoáng cho môi trường làm việc hiện đại.",
            "Thiết kế vạt ngang trẻ trung giúp các chàng trai dễ dàng buông ngoài quần jean hoặc đóng thùng nửa vạt đầy phong cách.",
            "Sự lựa chọn lý tưởng cho những ngày làm việc bận rộn cần di chuyển nhiều, hoặc các buổi dã ngoại, du lịch cùng gia đình."
        ]
    }
};

function initProductDetail() {
    // PHẦN 1: NÂNG CẤP - CLICK VÀO ẢNH HOẶC BẤT KỲ ĐÂU TRÊN CARD ĐỂ MỞ TRANG CHI TIẾT
    const productCards = document.querySelectorAll(".product-card");
    
    productCards.forEach(card => {
        // Đổi con trỏ chuột thành hình bàn tay khi di chuyển vào thẻ sản phẩm để báo hiệu click được
        card.style.cursor = "pointer"; 
        
        card.addEventListener("click", (e) => {
            // LOẠI TRỪ: Nếu người dùng click trúng nút "Thêm giỏ" hoặc nút "Yêu thích" (Trái tim) 
            // thì hệ thống chỉ thực hiện chức năng của nút đó, KHÔNG chuyển hướng sang trang chi tiết.
            if (e.target.closest(".love-btn") || (e.target.closest(".cart-btn") && !e.target.innerText.toUpperCase().includes("XEM CHI TIẾT"))) {
                return; 
            }

            // Tiến hành thu thập dữ liệu sản phẩm của thẻ vừa được click
            const name = card.querySelector("h3").innerText.trim();
            const price = card.querySelector(".price").innerText.trim();
            const image = card.querySelector("img").src;

            // Đóng gói dữ liệu lưu vào localStorage
            const selectedProduct = { name, price, image };
            localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));

            // Lập tức mở trang chi tiết sản phẩm
            window.location.href = "product-detail.html";
        });
    });

    // PHẦN 2: TỰ ĐỘNG THAY ĐỔI TOÀN BỘ NỘI DUNG (ẢNH, TÊN, GIÁ, MÔ TẢ) KHI VÀO TRANG CHI TIẾT
    const detailContainer = document.querySelector(".product-detail");
    if (detailContainer) {
        const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));
        
        if (selectedProduct) {
            // Đổi Ảnh, Tên, Giá và Tiêu đề trang giống như trước
            const imgEl = detailContainer.querySelector(".detail-image img");
            if (imgEl) imgEl.src = selectedProduct.image;

            const titleEl = detailContainer.querySelector(".detail-content h2");
            if (titleEl) titleEl.innerText = selectedProduct.name;

            const priceEl = detailContainer.querySelector(".detail-content .price");
            if (priceEl) priceEl.innerText = selectedProduct.price;

            document.title = selectedProduct.name + " - MENZZO";

            // --- XỬ LÝ ĐỔ ĐỘNG MÔ TẢ TỪ DATABASE ẢO ---
            const pData = productDatabase[selectedProduct.name];

            if (pData) {
                // A. Thay đổi phần MÔ TẢ NGẮN (các thẻ p ở trên, nằm trước tiêu đề Chọn Size)
                const shortPels = detailContainer.querySelectorAll(".detail-content > p");
                if (shortPels.length >= 2) {
                    shortPels[0].innerText = pData.shortDesc[0] || "";
                    shortPels[1].innerText = pData.shortDesc[1] || "";
                }

                // B. Thay đổi phần MÔ TẢ CHI TIẾT (Khối mô tả lớn ở phía dưới trang)
                // Tìm khối .cart-page có chứa tiêu đề "Mô tả sản phẩm"
                const allCartPages = document.querySelectorAll(".cart-page");
                let longDescContainer = null;
                
                allCartPages.forEach(page => {
                    const h2 = page.querySelector("h2");
                    if (h2 && h2.innerText.includes("Mô tả sản phẩm")) {
                        longDescContainer = page;
                    }
                });

                if (longDescContainer) {
                    // Tạo nội dung HTML mới cho khối mô tả lớn
                    let descHtml = `<h2>Mô tả sản phẩm</h2><br>`;
                    pData.longDesc.forEach(paragraph => {
                        descHtml += `<p>${paragraph}</p><br>`;
                    });
                    longDescContainer.innerHTML = descHtml;
                }
            }
        }
    }
}

// =========================
// 12. CHỨC NĂNG LỌC SẢN PHẨM (LIVE FILTER)
// =========================
function initFilter() {
    const filterBtn = document.querySelector(".filter-box .btn");
    if (!filterBtn) return;

    // Kho dữ liệu ánh xạ màu sắc sản phẩm theo đúng quy định của Hy
    const colorMapping = {
        "Áo Khoác Bomber": "Đen",
        "Áo Khoác Bomber Premium": "Đen", 
        "Quần Jean Slimfit": "Đen",
        "Áo Polo Basic": "Trắng",
        "Áo Sơ Mi Premium": "Trắng",
        "Quần Tây Slimfit": "Navy",
        "Bomber Luxury": "Navy",
        "Sơ Mi Modern Fit": "Navy",
        "Áo Polo Luxury": "Xám"
    };

    filterBtn.addEventListener("click", () => {
        // Lấy danh sách các nhóm bộ lọc trong HTML (0: Size, 1: Màu sắc, 2: Giá)
        const filterGroups = document.querySelectorAll(".filter-group");
        if (filterGroups.length < 3) return;

        // 1. Lấy danh sách màu sắc đang được tick chọn
        const colorCheckboxes = filterGroups[1].querySelectorAll("input[type='checkbox']:checked");
        const selectedColors = Array.from(colorCheckboxes).map(cb => cb.parentElement.innerText.trim());

        // 2. Lấy khoảng giá đang được chọn ở thẻ select
        const priceSelect = filterGroups[2].querySelector("select");
        const selectedPrice = priceSelect ? priceSelect.value.trim() : "Tất cả";

        // 3. Lấy tất cả thẻ sản phẩm hiện có trên trang Danh mục
        const productCards = document.querySelectorAll(".category-products .product-card");

        let foundCount = 0;

        productCards.forEach(card => {
            const name = card.querySelector("h3").innerText.trim();
            const priceText = card.querySelector(".price").innerText.trim();
            
            // Lọc bỏ chữ "đ" và dấu chấm để lấy ra con số nguyên thủy (VD: "1.290.000đ" -> 1290000)
            const priceValue = parseInt(priceText.replace(/\D/g, '')); 

            // --- ĐIỀU KIỆN A: LỌC THEO MÀU SẮC ---
            let colorPass = false;
            // Nếu người dùng không tick chọn màu nào -> Coi như muốn xem tất cả màu
            if (selectedColors.length === 0) {
                colorPass = true; 
            } else {
                // Lấy màu của sản phẩm hiện tại đối chiếu với danh sách đang tick chọn
                const productColor = colorMapping[name];
                if (selectedColors.includes(productColor)) {
                    colorPass = true; 
                }
            }

            // --- ĐIỀU KIỆN B: LỌC THEO GIÁ TIỀN ---
            let pricePass = false;
            if (selectedPrice === "Tất cả") {
                pricePass = true;
            } else if (selectedPrice === "Dưới 500K" && priceValue < 500000) {
                pricePass = true;
            } else if (selectedPrice === "500K - 1 triệu" && priceValue >= 500000 && priceValue <= 1000000) {
                pricePass = true;
            } else if (selectedPrice === "Trên 1 triệu" && priceValue > 1000000) {
                pricePass = true;
            }

            // --- ĐIỀU KIỆN C: LỌC THEO SIZE ---
            // Do quy định của bạn là "sản phẩm nào cũng có đủ size", nên phần này luôn trả về true!
            const sizePass = true; 

            // HIỂN THỊ SẢN PHẨM: Nếu vượt qua cả Giá, Màu và Size
            if (colorPass && pricePass && sizePass) {
                card.style.display = "block";
                foundCount++;
            } else {
                card.style.display = "none";
            }
        });

        // Báo lỗi nhẹ nhàng nếu lọc gắt quá không còn sản phẩm nào
        if (foundCount === 0) {
            alert("Rất tiếc, không có sản phẩm nào phù hợp với bộ lọc hiện tại!");
            // Mở lại toàn bộ sản phẩm để trang web không bị trống trải
            productCards.forEach(card => card.style.display = "block");
            
            // Bỏ tick tất cả màu sắc
            colorCheckboxes.forEach(cb => cb.checked = false);
            // Đưa giá về "Tất cả"
            if(priceSelect) priceSelect.selectedIndex = 0; 
        }
    });
}
// ==========================================
// KHỞI CHẠY TẤT CẢ CÁC HÀM KHI TẢI TRANG
// ==========================================
updateCartCount();
handleNavbarAuth();
initProductDetail();
syncFavoriteButtons();
initFavoriteButtons();
renderFavoritePage();
initAddToCart();
renderCartPage();
renderCheckoutPage();
initQtyButtons();
initSearch();
initFilter();