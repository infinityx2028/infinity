# Admin Panel - Comprehensive Testing Checklist

**Last Updated:** February 9, 2026  
**Status:** Ready for Final Testing & Commit

---

## 🔐 Admin Authentication

- [ ] **Admin Login Page** (`/admin/login`)
  - [ ] Email field accepts valid email format
  - [ ] Password field hides input
  - [ ] Login with valid credentials works
  - [ ] Login with invalid credentials shows error
  - [ ] Token is stored in localStorage
  - [ ] Redirects to admin dashboard on success

---

## 📊 Admin Dashboard (`/admin/dashboard`)

**Features to Test:**
- [ ] Displays total orders count
- [ ] Displays today's orders count  
- [ ] Displays pending orders count
- [ ] Displays delivered orders count
- [ ] Displays total categories count
- [ ] Navigation links to all admin sections work
- [ ] Logout button functions properly
- [ ] Authentication check (redirect to login if not authenticated)

---

## 🛍️ Product Management (`/admin/products`)

### Add Products
- [ ] "Add New Product" button opens form
- [ ] Form includes all fields:
  - [ ] Product Name
  - [ ] Price
  - [ ] Description
  - [ ] Category (dropdown with categories)
  - [ ] Weight
  - [ ] Dimensions
  - [ ] Image upload (primary)
  - [ ] Multiple images upload
  - [ ] Instagram links
  - [ ] In Stock toggle
  - [ ] Best Seller checkbox ✅
  - [ ] Pricing Type (standard/quantity-based)
  - [ ] Dynamic pricing for signature day tshirts
- [ ] Image upload to Cloudinary works
- [ ] Product is saved successfully
- [ ] Success message appears
- [ ] Form resets after save
- [ ] Product appears in products list

### Edit Products
- [ ] Click Edit on product opens form with populated data
- [ ] All fields are editable
- [ ] Changes save correctly
- [ ] Best Seller flag can be toggled
- [ ] Images can be added/removed
- [ ] Success message appears after update

### Delete Products
- [ ] Delete button shows confirmation dialog
- [ ] Confirmed deletion removes product from list
- [ ] Product is removed from database
- [ ] Associated orders reference is maintained

### Best Seller Management
- [ ] Best seller checkbox works
- [ ] Best seller products are marked
- [ ] Best sellers appear in homepage showcase
- [ ] Can toggle on/off without issues

### Product Search
- [ ] Search by product name works
- [ ] Results filter correctly
- [ ] Clear search shows all products

---

## 📂 Category Management (`/admin/categories`)

### Create Categories
- [ ] "Add Category" form opens
- [ ] Form includes:
  - [ ] Title (name)
  - [ ] Description
  - [ ] Emoji/Icon selector
  - [ ] Sub-categories (add/remove)
  - [ ] Showcase Products (multi-select)
- [ ] Category is created successfully
- [ ] Success message appears
- [ ] Category appears in list

### Edit Categories
- [ ] Click Edit opens category form with populated data
- [ ] All fields are editable
- [ ] Sub-categories can be added/removed
- [ ] Showcase products can be updated
- [ ] Changes save correctly
- [ ] Category updates reflect on homepage

### Delete Categories
- [ ] Delete button with confirmation works
- [ ] Products in category are not deleted
- [ ] Category references are cleaned up
- [ ] Products remain accessible

### Showcase Products
- [ ] Can select multiple products for showcase
- [ ] Showcase products appear on category page
- [ ] Order of showcase products is maintained
- [ ] Can remove products from showcase

---

## 📱 Phone Models Management (`/admin/phone-models`)

### Add Phone Companies
- [ ] "Add Company" form opens
- [ ] Can enter company name (required field)
- [ ] Can add multiple models to company
- [ ] Form validates input
- [ ] Company is saved successfully

### Add Models to Company
- [ ] Each company has list of models
- [ ] "Add Model" input and button available
- [ ] New model is added to company list
- [ ] Models are saved with company
- [ ] Model appears in dropdown on product form

### Edit Companies
- [ ] Edit button opens form with company name
- [ ] Company name is editable
- [ ] Models are displayed and editable
- [ ] Changes save correctly

### Edit Models
- [ ] Can click edit on individual model
- [ ] Model name is editable
- [ ] Changes save to company
- [ ] Updated model appears in dropdowns

### Delete Companies
- [ ] Delete company with confirmation dialog
- [ ] All models in company are deleted
- [ ] Company is removed from list
- [ ] Products using this company handle the removal

### Delete Models
- [ ] Delete model button on individual model works
- [ ] Confirmation dialog shows
- [ ] Model is removed from company
- [ ] Other models in same company remain
- [ ] Products using this model are updated/maintained

### Phone Models in Products
- [ ] When adding product, can select phone company
- [ ] When company selected, can choose models
- [ ] Selected models are saved with product
- [ ] Models appear correctly in product details

---

## 📦 Order Management (`/admin/orders`)

### View Orders
- [ ] All orders are listed with details:
  - [ ] Order ID
  - [ ] Customer Name
  - [ ] Status badge
  - [ ] Total Price
  - [ ] Order Date
  - [ ] Customer phone/email
- [ ] Orders load without errors
- [ ] Pagination works (if many orders)

### Filter Orders
- [ ] Filter dropdown shows all statuses:
  - [ ] All (default)
  - [ ] Pending
  - [ ] Confirmed
  - [ ] Processing
  - [ ] Shipped
  - [ ] Delivered
  - [ ] Cancelled
- [ ] Filtering works correctly
- [ ] Order count updates based on filter

### Expand Order Details
- [ ] Click arrow expands order details
- [ ] Shows all items in order
- [ ] Shows customization details
- [ ] Shows delivery address
- [ ] Shows payment method
- [ ] Shows order notes section

### Update Order Status
- [ ] Status dropdown appears when editing
- [ ] Can select next status in flow
- [ ] Status updates in database
- [ ] Success message appears
- [ ] Status badge updates in list

### Order Notes
- [ ] Notes field is editable
- [ ] Can add/update notes
- [ ] Notes save to database
- [ ] Notes persist on page reload

### Confirm Payment
- [ ] Payment confirmation button available
- [ ] Marks payment as received
- [ ] Updates order status if needed
- [ ] Success message appears

### Generate Invoice
- [ ] Invoice button generates PDF
- [ ] Invoice includes:
  - [ ] Order ID
  - [ ] Customer details
  - [ ] All items with prices
  - [ ] Customization details
  - [ ] Total amount
  - [ ] Order date
  - [ ] Delivery address
- [ ] PDF downloads successfully
- [ ] Format is clean and professional

### Ship Order (Shiprocket Integration)
- [ ] Ship button available for ready orders
- [ ] Can enter tracking details
- [ ] Shipment is triggered successfully
- [ ] Order status updates to 'shipped'
- [ ] Tracking info is saved
- [ ] Customer receives notification

---

## ✅ Additional Features

### Authentication & Security
- [ ] Admin token validation works
- [ ] Unauthorized access redirected to login
- [ ] Token expiry handling
- [ ] Logout clears token and redirects

### Error Handling
- [ ] Network errors show appropriate messages
- [ ] Form validation shows errors
- [ ] Empty field validation works
- [ ] Duplicate entries are detected

### UI/UX
- [ ] Responsive design on mobile
- [ ] Buttons have hover states
- [ ] Loading states show spinners
- [ ] Success/error messages are clear
- [ ] Forms are user-friendly

### Database
- [ ] Products are persisted correctly
- [ ] Categories are persisted correctly
- [ ] Phone models are persisted correctly
- [ ] Orders are persisted correctly
- [ ] No duplicate entries are created
- [ ] Relationships are maintained

---

## 🧪 Testing Scenarios

### Scenario 1: Create T-Shirt Product with Best Seller Flag
1. Navigate to Products
2. Click "Add New Product"
3. Fill form:
   - Name: "Custom T-Shirt"
   - Price: 499
   - Category: Select a category
   - Check "Best Seller" checkbox
   - Upload image
4. Save and verify:
   - Product appears in list
   - Best Seller flag is displayed
   - Can be found on homepage showcase

### Scenario 2: Create Phone Case in Phone Models
1. Go to Phone Models
2. Add new company: "Samsung"
3. Add models: "Galaxy S21", "Galaxy S22", "Galaxy A52"
4. Go to Products and add new product
5. Select category: Phone Cases
6. Choose phone company: Samsung
7. Select models: Galaxy S21, Galaxy S22
8. Save and verify phone options appear correctly

### Scenario 3: Update Order Status Flow
1. Go to Orders
2. Find pending order
3. Update status: pending → confirmed
4. Update status: confirmed → processing
5. Update status: processing → shipped
6. Update status: shipped → delivered
7. Verify each status updates correctly

### Scenario 4: Category with Showcase Products
1. Go to Categories
2. Create new category: "Anniversaries"
3. Add 4 showcase products
4. Edit and change showcase products
5. Delete category (products should remain)
6. Verify on homepage

---

## 📋 Pre-Commit Checklist

Before final commit:

- [ ] No console errors in dev tools
- [ ] All API endpoints respond correctly
- [ ] Database has clean data
- [ ] Images load properly
- [ ] Mobile responsive design works
- [ ] All auth tokens are valid
- [ ] No hardcoded API URLs (all using env vars)
- [ ] Error handling for all operations
- [ ] Loading states for async operations
- [ ] Success messages for all CRUD operations
- [ ] Validation on all forms
- [ ] No security vulnerabilities
- [ ] All routes protected appropriately
- [ ] Database backup ready (if needed)

---

## 🚀 Deployment Checklist

- [ ] Environment variables set on production
- [ ] Database connection string correct
- [ ] Cloudinary credentials valid
- [ ] CORS settings allow frontend domain
- [ ] All routes tested on production URL
- [ ] Admin can log in on production
- [ ] Images upload to production Cloudinary
- [ ] Orders save to production database
- [ ] Admin panel is secure (HTTPS)
- [ ] No debug logs in console

---

## 📝 Notes

- All test cases should be run in different browsers (Chrome, Firefox, Safari if possible)
- Test on both desktop and mobile devices
- Check all API responses in Network tab
- Verify localStorage is working properly
- Test with and without internet connection interruptions

**Last Tested:** _______________  
**Tested By:** _______________  
**Result:** ✅ PASS / ❌ FAIL  

