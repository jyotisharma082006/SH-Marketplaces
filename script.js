const demoProducts = [
    {id:"1",name:"Dell Inspiron Laptop",category:"Electronics",price:28500,condition:"Good",location:"Ludhiana",description:"Reliable laptop suitable for study and office work.",seller:"ReMarket Seller",contact:"Contact through ReMarket",icon:"💻"},
    {id:"2",name:"Used Car",category:"Vehicles",price:450000,condition:"Good",location:"Delhi",description:"Pre-owned car in good running condition.",seller:"ReMarket Seller",contact:"Contact through ReMarket",icon:"🚗"},
    {id:"3",name:"Wooden Sofa Set",category:"Furniture",price:18000,condition:"Excellent",location:"Mumbai",description:"Comfortable sofa set suitable for a living room.",seller:"ReMarket Seller",contact:"Contact through ReMarket",icon:"🛋️"},
    {id:"4",name:"iPhone 13",category:"Mobiles",price:32000,condition:"Good",location:"Pune",description:"Pre-owned smartphone with good condition.",seller:"ReMarket Seller",contact:"Contact through ReMarket",icon:"📱"},
    {id:"5",name:"Refrigerator",category:"Appliances",price:22000,condition:"Good",location:"Chandigarh",description:"Working home refrigerator.",seller:"ReMarket Seller",contact:"Contact through ReMarket",icon:"🧊"},
    {id:"6",name:"Fitness Cycle",category:"Sports",price:7500,condition:"Excellent",location:"Amritsar",description:"Home exercise cycle in excellent condition.",seller:"ReMarket Seller",contact:"Contact through ReMarket",icon:"🏋️"}
];

function getUsers(){return JSON.parse(localStorage.getItem("remarket_users")||"[]")}
function getCurrentUser(){return JSON.parse(localStorage.getItem("remarket_current_user")||"null")}
function getListings(){return JSON.parse(localStorage.getItem("remarket_listings")||"[]")}
function saveListings(items){localStorage.setItem("remarket_listings",JSON.stringify(items))}
function allProducts(){return [...demoProducts,...getListings()]}

function updateHeader(){
    const box=document.getElementById("headerActions");
    if(!box)return;
    const user=getCurrentUser();
    if(user){
        box.innerHTML='<span class="login-link">Hi, '+escapeHtml(user.name.split(" ")[0])+'</span><button class="dark-btn small-btn" onclick="logout()">Logout</button>';
    }else{
        box.innerHTML='<a href="login.html" class="login-link">Login</a><a href="register.html" class="dark-btn small-btn">Join ReMarket</a>';
    }
}
function logout(){localStorage.removeItem("remarket_current_user");location.href="index.html"}

function escapeHtml(text){
    return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function renderProducts(){
    const list=document.getElementById("product-list");
    if(!list)return;
    const search=(document.getElementById("searchInput")?.value||"").toLowerCase();
    const category=document.getElementById("categoryFilter")?.value||"all";
    const products=allProducts().filter(p=>{
        const matchSearch=(p.name+" "+p.category+" "+p.location).toLowerCase().includes(search);
        return matchSearch && (category==="all" || p.category===category);
    });
    const count=document.getElementById("productCount");
    if(count)count.textContent=products.length+" Products";
    if(!products.length){list.innerHTML='<div class="empty-state">No products found.</div>';return}
    list.innerHTML=products.map(productCard).join("");
}
function productCard(p){
    return `<article class="product-card">
        <div class="product-card-image">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover">`:(p.icon||"📦")}</div>
        <div class="product-card-body">
            <span class="category">${escapeHtml(p.category)}</span>
            <h3>${escapeHtml(p.name)}</h3>
            <div class="price">₹${Number(p.price).toLocaleString("en-IN")}</div>
            <p>${escapeHtml(p.location)} · ${escapeHtml(p.condition)}</p>
            <div class="card-actions"><a href="product-details.html?id=${encodeURIComponent(p.id)}">View Details</a></div>
        </div>
    </article>`;
}

function setupProducts(){
    if(!document.getElementById("product-list"))return;
    const search=document.getElementById("searchInput"), filter=document.getElementById("categoryFilter");
    search?.addEventListener("input",renderProducts);filter?.addEventListener("change",renderProducts);
    const category=new URLSearchParams(location.search).get("category");
    if(category && filter){filter.value=category}
    renderProducts();
}

function setupRegister(){
    const form=document.getElementById("registerForm");if(!form)return;
    form.addEventListener("submit",e=>{
        e.preventDefault();
        const name=document.getElementById("registerName").value.trim();
        const email=document.getElementById("registerEmail").value.trim().toLowerCase();
        const password=document.getElementById("registerPassword").value;
        const confirm=document.getElementById("confirmPassword").value;
        if(password!==confirm){alert("Passwords do not match.");return}
        const users=getUsers();
        if(users.some(u=>u.email===email)){alert("An account with this email already exists.");return}
        users.push({name,email,password});localStorage.setItem("remarket_users",JSON.stringify(users));
        localStorage.setItem("remarket_current_user",JSON.stringify({name,email}));
        alert("Account created successfully.");
        location.href="index.html";
    });
}

function setupLogin(){
    const form=document.getElementById("loginForm");if(!form)return;
    form.addEventListener("submit",e=>{
        e.preventDefault();
        const email=document.getElementById("loginEmail").value.trim().toLowerCase();
        const password=document.getElementById("loginPassword").value;
        const user=getUsers().find(u=>u.email===email && u.password===password);
        if(!user){alert("Invalid email or password.");return}
        localStorage.setItem("remarket_current_user",JSON.stringify({name:user.name,email:user.email}));
        alert("Login successful.");
        location.href="index.html";
    });
}

function setupSell(){
    const form=document.getElementById("sellForm");if(!form)return;
    const image=document.getElementById("productImage");
    image?.addEventListener("change",()=>{
        const file=image.files[0];const preview=document.getElementById("imagePreview");const img=document.getElementById("previewImg");
        if(!file){preview.style.display="none";return}
        const reader=new FileReader();reader.onload=e=>{img.src=e.target.result;preview.style.display="block"};reader.readAsDataURL(file);
    });
    form.addEventListener("submit",e=>{
        e.preventDefault();
        const user=getCurrentUser();
        if(!user){alert("Please register or login before selling a product.");location.href="login.html";return}
        const file=image.files[0];
        const finish=(imageData)=>{
            const item={
                id:"user-"+Date.now(),
                name:document.getElementById("productName").value.trim(),
                category:document.getElementById("productCategory").value,
                price:Number(document.getElementById("productPrice").value),
                condition:document.getElementById("productCondition").value,
                location:document.getElementById("productLocation").value.trim(),
                description:document.getElementById("productDescription").value.trim(),
                seller:user.name,contact:user.email,icon:"📦",image:imageData||""
            };
            const listings=getListings();listings.push(item);saveListings(listings);
            alert("Product listed successfully.");location.href="dashboard.html";
        };
        if(file){const reader=new FileReader();reader.onload=e=>finish(e.target.result);reader.readAsDataURL(file)}else finish("");
    });
}

function setupDashboard(){
    const target=document.getElementById("myListings");if(!target)return;
    const user=getCurrentUser();
    if(!user){document.getElementById("welcomeText").textContent="Please login to manage your listings.";target.innerHTML='<div class="empty-state"><a href="login.html" class="dark-btn">Login</a></div>';return}
    document.getElementById("welcomeText").textContent="Manage the products you have listed, "+user.name+".";
    const mine=getListings().filter(p=>p.seller===user.name);
    document.getElementById("listingCount").textContent=mine.length;
    if(!mine.length){target.innerHTML='<div class="empty-state">You have no listings yet.<br><br><a href="sell.html" class="dark-btn">+ Sell a Product</a></div>';return}
    target.innerHTML=mine.map(p=>productCardWithDelete(p)).join("");
}
function productCardWithDelete(p){
    return `<article class="product-card"><div class="product-card-image">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover">`:(p.icon||"📦")}</div><div class="product-card-body"><span class="category">${escapeHtml(p.category)}</span><h3>${escapeHtml(p.name)}</h3><div class="price">₹${Number(p.price).toLocaleString("en-IN")}</div><p>${escapeHtml(p.location)} · ${escapeHtml(p.condition)}</p><div class="card-actions"><a href="product-details.html?id=${encodeURIComponent(p.id)}">View</a><button class="delete-btn" onclick="deleteListing('${p.id}')">Delete</button></div></div></article>`;
}
function deleteListing(id){saveListings(getListings().filter(p=>p.id!==id));setupDashboard()}

function setupDetails(){
    const name=document.getElementById("detailName");if(!name)return;
    const id=new URLSearchParams(location.search).get("id");
    const p=allProducts().find(x=>String(x.id)===String(id));
    if(!p){name.textContent="Product not found";return}
    document.getElementById("detailCategory").textContent=p.category;
    name.textContent=p.name;
    document.getElementById("detailPrice").textContent="₹"+Number(p.price).toLocaleString("en-IN");
    document.getElementById("detailCondition").textContent=p.condition;
    document.getElementById("detailLocation").textContent=p.location;
    document.getElementById("detailSeller").textContent=p.seller||"ReMarket Seller";
    document.getElementById("detailContact").textContent=p.contact||"Contact through ReMarket";
    document.getElementById("detailDescription").textContent=p.description||"No description provided.";
    const img=document.getElementById("detailImage");
    if(p.image){img.src=p.image}else{img.removeAttribute("src");img.alt=p.icon||"Product";img.style.display="none";img.parentElement.textContent=p.icon||"📦";img.parentElement.style.fontSize="110px"}
    window.currentProduct=p;
}
function purchaseProduct(){
    const user=getCurrentUser();
    if(!user){alert("Please register or login before purchasing.");location.href="login.html";return}
    alert("Purchase request received. The seller can be contacted using the details shown on this page.");
}

document.addEventListener("DOMContentLoaded",()=>{
    updateHeader();setupProducts();setupRegister();setupLogin();setupSell();setupDashboard();setupDetails();
});
