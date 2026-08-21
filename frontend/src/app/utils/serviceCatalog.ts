export type ServiceField = {
  name: string;
  label: string;
  type?: 'text' | 'tel' | 'date' | 'select' | 'file' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  col?: 1 | 2;
};

export type PortalService = {
  id: string;
  title: string;
  category: string;
  description: string;
  fee: number;
  commission?: number;
  icon: string;
  accent: string;
  badge?: string;
  fields?: ServiceField[];
  active?: boolean;
};

const commonCustomer: ServiceField[] = [
  { name: 'customerName', label: 'Customer Full Name', placeholder: 'Enter customer full name', required: true },
  { name: 'customerMobile', label: 'Customer Mobile Number', type: 'tel', placeholder: '10 digit mobile number', required: true },
];

const aadhaarBase: ServiceField[] = [
  ...commonCustomer,
  { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'tel', placeholder: '12 digit Aadhaar', required: true, col: 2 },
];

export const aadhaarServices: PortalService[] = [
  {
    id: 'name-change', title: 'Name Change Form', category: 'Aadhaar Correction',
    description: 'Old/New name verification with original white-background photo and supporting document.', fee: 1200, icon: '✍️', accent: '#0ea5e9', badge: 'Popular',
    fields: [...aadhaarBase,
      { name: 'oldName', label: 'Old Name', placeholder: 'Name as currently on Aadhaar', required: true },
      { name: 'newName', label: 'New Name', placeholder: 'Enter new name', required: true },
      { name: 'whitePhoto', label: 'Original White Background Photo', type: 'file', required: true, col: 2 },
      { name: 'supportDocument', label: 'Original / Background Supporting Document', type: 'file', required: true, col: 2 },
    ]
  },
  {
    id: 'dob-change', title: 'DOB Change Form', category: 'Aadhaar Correction',
    description: 'Old/New DOB verification with original white-background photo and DOB supporting document.', fee: 1200, icon: '📅', accent: '#6366f1', badge: 'Trending',
    fields: [...aadhaarBase,
      { name: 'oldDob', label: 'Old DOB', type: 'date', required: true },
      { name: 'newDob', label: 'New DOB', type: 'date', required: true },
      { name: 'whitePhoto', label: 'Original White Background Photo', type: 'file', required: true, col: 2 },
      { name: 'dobDocument', label: 'Original / Background DOB Document', type: 'file', required: true, col: 2 },
    ]
  },
  {
    id: 'gender-change', title: 'Gender Change Form', category: 'Aadhaar Correction',
    description: 'Gender update with original white-background photo and original/background supporting document.', fee: 1200, icon: '🚻', accent: '#ec4899',
    fields: [...aadhaarBase,
      { name: 'oldGender', label: 'Old Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'newGender', label: 'New Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'whitePhoto', label: 'Original White Background Photo', type: 'file', required: true, col: 2 },
      { name: 'supportDocument', label: 'Original / Background Gender Supporting Document', type: 'file', required: true, col: 2 },
    ]
  },
  {
    id: 'address-update', title: 'C/O Address Update Form', category: 'Aadhaar Correction',
    description: 'Complete C/O address update with Village, Post Office, Police Station, District, State and PIN.', fee: 400, icon: '🏠', accent: '#10b981', badge: 'Fast',
    fields: [...aadhaarBase,
      { name: 'careOf', label: 'Care Of (C/O) Full Name', placeholder: 'Enter C/O person full name', required: true, col: 2 },
      { name: 'village', label: 'Village', placeholder: 'Village / Mohalla', required: true },
      { name: 'postOffice', label: 'Post Office', placeholder: 'Post Office', required: true },
      { name: 'policeStation', label: 'Police Station', placeholder: 'Police Station', required: true },
      { name: 'state', label: 'State', type: 'select', options: ['Bihar', 'Uttar Pradesh', 'Delhi', 'Jharkhand', 'West Bengal', 'Maharashtra', 'Other'], required: true },
      { name: 'district', label: 'District', placeholder: 'District', required: true },
      { name: 'pincode', label: 'PIN Code', type: 'tel', placeholder: '6 digit PIN', required: true },
      { name: 'passportPhoto', label: 'Passport Size Photo', type: 'file', required: true, col: 2 },
      { name: 'aadhaarOtp', label: 'Aadhaar OTP', type: 'tel', placeholder: 'Enter Aadhaar OTP', required: true, col: 2 },
    ]
  },
  {
    id: 'mobile-update', title: 'Mobile No Update', category: 'Aadhaar Correction',
    description: 'Customer mobile number update/link request. After payment the request goes to the Waiting Room.', fee: 150, icon: '📱', accent: '#f59e0b', badge: 'Live',
    fields: [...aadhaarBase,
      { name: 'operatorId', label: 'VPN ID / Operator ID', placeholder: 'Enter VPN ID if available', required: false, col: 2 },
      { name: 'newMobile', label: 'New Mobile Number', type: 'tel', placeholder: 'Enter new 10 digit mobile', required: true, col: 2 },
      { name: 'supportDocument', label: 'Aadhaar Supporting Document', type: 'file', required: true, col: 2 },
    ]
  },
  {
    id: 'aadhaar-pvc', title: 'Aadhaar PVC Card', category: 'Aadhaar Services',
    description: 'PVC card order request with customer details and delivery address.', fee: 99, icon: '🪪', accent: '#06b6d4', badge: 'Active',
    fields: [...aadhaarBase,
      { name: 'address', label: 'Delivery Address', type: 'textarea', placeholder: 'Complete delivery address', required: true, col: 2 },
      { name: 'pincode', label: 'PIN Code', type: 'tel', placeholder: '6 digit PIN', required: true },
    ]
  },
  {
    id: 'aadhaar-download', title: 'Aadhaar Download / Print', category: 'Aadhaar Services',
    description: 'Request assistance for Aadhaar download and high-quality print.', fee: 30, icon: '🖨️', accent: '#8b5cf6', badge: 'Active',
    fields: [...aadhaarBase, { name: 'otp', label: 'Aadhaar OTP', type: 'tel', placeholder: 'Enter OTP', required: true, col: 2 }]
  },
];

export const allServices: PortalService[] = [
  ...aadhaarServices,
  { id: 'pan-card', title: 'PAN Card Service', category: 'PAN & Tax', description: 'PAN application, correction and reprint request with document upload.', fee: 180, commission: 15, icon: '💳', accent: '#0ea5e9', badge: 'Popular', fields: [...commonCustomer, { name: 'panType', label: 'PAN Card Type', type: 'select', options: ['New PAN', 'Correction', 'Reprint'], required: true }, { name: 'documentType', label: 'Document Type', type: 'select', options: ['Aadhaar Card', 'Passport', 'Driving Licence', 'Voter ID', 'Other'], required: true }, { name: 'documentFront', label: 'Document Front', type: 'file', required: true }, { name: 'documentBack', label: 'Document Back', type: 'file', required: false }] },
  { id: 'gst-registration', title: 'GST Registration', category: 'Government & Legal', description: 'GST registration request and document collection.', fee: 999, commission: 150, icon: '📄', accent: '#10b981', badge: 'New', fields: [...commonCustomer, { name: 'businessName', label: 'Business / Firm Name', required: true }, { name: 'businessType', label: 'Business Type', type: 'select', options: ['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Other'], required: true }, { name: 'pan', label: 'PAN Number', required: true }, { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'tel', required: true }, { name: 'address', label: 'Business Address', type: 'textarea', required: true, col: 2 }, { name: 'documents', label: 'Supporting Documents', type: 'file', required: true, col: 2 }] },
  { id: 'gst-return', title: 'GST Return Filing', category: 'Government & Legal', description: 'GST return filing assistance for registered businesses.', fee: 499, commission: 75, icon: '🧾', accent: '#14b8a6', fields: [...commonCustomer, { name: 'gstin', label: 'GSTIN', required: true }, { name: 'returnPeriod', label: 'Return Period', placeholder: 'e.g. July 2026', required: true }, { name: 'documents', label: 'Return Documents', type: 'file', required: true, col: 2 }] },
  { id: 'aeps', title: 'AEPS Cash Withdrawal', category: 'Financial & AEPS', description: 'AEPS transaction request and operator details.', fee: 0, commission: 8.5, icon: '🏧', accent: '#f59e0b', badge: 'Popular', fields: [...commonCustomer, { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'tel', required: true }, { name: 'bankName', label: 'Bank Name', required: true }, { name: 'amount', label: 'Amount', type: 'number', required: true }, { name: 'operatorId', label: 'Operator ID', required: true }] },
  { id: 'dmt', title: 'Domestic Money Transfer (DMT)', category: 'Financial & AEPS', description: 'Secure domestic money transfer request.', fee: 5, commission: 5, icon: '💸', accent: '#ec4899', badge: 'Live', fields: [...commonCustomer, { name: 'senderMobile', label: 'Sender Mobile', type: 'tel', required: true }, { name: 'beneficiaryName', label: 'Beneficiary Name', required: true }, { name: 'accountNumber', label: 'Beneficiary Account Number', required: true }, { name: 'ifsc', label: 'IFSC Code', required: true }, { name: 'amount', label: 'Transfer Amount', type: 'number', required: true }] },
  { id: 'bbps', title: 'BBPS Utility Bill Payment', category: 'Financial & AEPS', description: 'Electricity, water, gas, broadband, FASTag and other bill payment request.', fee: 2, commission: 2, icon: '⚡', accent: '#8b5cf6', badge: 'Trending', fields: [...commonCustomer, { name: 'billerCategory', label: 'Biller Category', type: 'select', options: ['Electricity', 'Water', 'Gas', 'Broadband', 'FASTag', 'Mobile Postpaid', 'Other'], required: true }, { name: 'consumerNumber', label: 'Consumer / Account Number', required: true }, { name: 'amount', label: 'Bill Amount', type: 'number', required: true }] },
  { id: 'mobile-recharge', title: 'Mobile Recharge', category: 'Financial & AEPS', description: 'Prepaid mobile recharge request.', fee: 0, commission: 3, icon: '📲', accent: '#22c55e', badge: 'Active', fields: [{ name: 'mobile', label: 'Recharge Mobile Number', type: 'tel', required: true }, { name: 'operator', label: 'Operator', type: 'select', options: ['Airtel', 'Jio', 'Vi', 'BSNL', 'Other'], required: true }, { name: 'amount', label: 'Recharge Amount', type: 'number', required: true }] },
  { id: 'dth-recharge', title: 'DTH Recharge', category: 'Financial & AEPS', description: 'DTH recharge request for major operators.', fee: 0, commission: 3, icon: '📺', accent: '#ef4444', fields: [{ name: 'customerName', label: 'Customer Name', required: true }, { name: 'operator', label: 'DTH Operator', type: 'select', options: ['Tata Play', 'Airtel DTH', 'Dish TV', 'Sun Direct', 'Videocon', 'Other'], required: true }, { name: 'subscriberId', label: 'Subscriber ID', required: true }, { name: 'amount', label: 'Recharge Amount', type: 'number', required: true }] },
  { id: 'voter-services', title: 'Voter ID Services', category: 'Government & Legal', description: 'Voter ID application, correction and download assistance.', fee: 150, commission: 20, icon: '🗳️', accent: '#3b82f6', fields: [...commonCustomer, { name: 'serviceType', label: 'Service Type', type: 'select', options: ['New Registration', 'Correction', 'Address Update', 'Download'], required: true }, { name: 'epic', label: 'EPIC Number', required: false }, { name: 'document', label: 'Supporting Document', type: 'file', required: true, col: 2 }] },
  { id: 'driving-license', title: 'Driving Licence Services', category: 'Government & Legal', description: 'DL application and correction assistance.', fee: 350, commission: 40, icon: '🚗', accent: '#64748b', fields: [...commonCustomer, { name: 'serviceType', label: 'Service Type', type: 'select', options: ['Learner Licence', 'Permanent Licence', 'Renewal', 'Correction', 'Duplicate'], required: true }, { name: 'state', label: 'State', required: true }, { name: 'documents', label: 'Supporting Documents', type: 'file', required: true, col: 2 }] },
  { id: 'birth-certificate', title: 'Birth Certificate', category: 'Government & Legal', description: 'Original birth certificate generation request. Expected processing: 7–10 working days.', fee: 1400, commission: 100, icon: '👶', accent: '#ef4444', badge: '7–10 Days', fields: [...commonCustomer, { name: 'childName', label: 'Child Name', required: true }, { name: 'childDob', label: 'Child Date of Birth', type: 'date', required: true }, { name: 'placeOfBirth', label: 'Place of Birth', required: true }, { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true }, { name: 'motherName', label: "Mother's Name", required: true }, { name: 'fatherName', label: "Father's Name", required: true }, { name: 'village', label: 'Village', required: true }, { name: 'postOffice', label: 'Post Office', required: true }, { name: 'policeStation', label: 'Police Station', required: true }, { name: 'district', label: 'District', required: true }, { name: 'state', label: 'State', required: true }, { name: 'pincode', label: 'PIN Code', type: 'tel', required: true }, { name: 'aadhaar', label: 'Parent Aadhaar', type: 'tel', required: true }, { name: 'documents', label: 'Supporting Documents', type: 'file', required: true, col: 2 }] },
  { id: 'income-certificate', title: 'Income Certificate', category: 'Government & Legal', description: 'Income certificate application assistance.', fee: 250, commission: 30, icon: '💰', accent: '#84cc16', fields: [...commonCustomer, { name: 'annualIncome', label: 'Annual Income', type: 'number', required: true }, { name: 'occupation', label: 'Occupation', required: true }, { name: 'address', label: 'Address', type: 'textarea', required: true, col: 2 }, { name: 'document', label: 'Supporting Document', type: 'file', required: true, col: 2 }] },
  { id: 'caste-certificate', title: 'Caste Certificate', category: 'Government & Legal', description: 'Caste certificate application assistance.', fee: 250, commission: 30, icon: '📜', accent: '#a855f7', fields: [...commonCustomer, { name: 'category', label: 'Category', type: 'select', options: ['SC', 'ST', 'OBC', 'EWS', 'Other'], required: true }, { name: 'address', label: 'Address', type: 'textarea', required: true, col: 2 }, { name: 'document', label: 'Supporting Document', type: 'file', required: true, col: 2 }] },
  { id: 'domicile-certificate', title: 'Domicile Certificate', category: 'Government & Legal', description: 'Domicile/residence certificate application assistance.', fee: 250, commission: 30, icon: '🏡', accent: '#06b6d4', fields: [...commonCustomer, { name: 'state', label: 'State', required: true }, { name: 'district', label: 'District', required: true }, { name: 'address', label: 'Complete Address', type: 'textarea', required: true, col: 2 }, { name: 'document', label: 'Supporting Document', type: 'file', required: true, col: 2 }] },
  { id: 'passport', title: 'Passport Assistance', category: 'Government & Legal', description: 'Passport application assistance and document collection.', fee: 799, commission: 80, icon: '🛂', accent: '#2563eb', fields: [...commonCustomer, { name: 'serviceType', label: 'Application Type', type: 'select', options: ['Fresh Passport', 'Renewal', 'Reissue'], required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'address', label: 'Current Address', type: 'textarea', required: true, col: 2 }, { name: 'documents', label: 'Supporting Documents', type: 'file', required: true, col: 2 }] },
  { id: 'rc-pdf', title: 'RC Blue PDF', category: 'Print Portal', description: 'Vehicle RC PDF request.', fee: 50, commission: 8, icon: '🚘', accent: '#0891b2', fields: [{ name: 'customerName', label: 'Customer Name', required: true }, { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true }, { name: 'vehicleNumber', label: 'Vehicle Number', required: true }, { name: 'rcNumber', label: 'RC Number', required: true }] },
  { id: 'vehicle-challan', title: 'Vehicle Challan', category: 'Print Portal', description: 'Vehicle challan status/check request.', fee: 30, commission: 5, icon: '🚨', accent: '#f97316', fields: [{ name: 'customerName', label: 'Customer Name', required: true }, { name: 'mobile', label: 'Mobile Number', type: 'tel', required: true }, { name: 'vehicleNumber', label: 'Vehicle Number', required: true }] },
  { id: 'voter-mobile-link', title: 'Voter Mobile Link', category: 'Print Portal', description: 'Voter mobile linking assistance request.', fee: 80, commission: 10, icon: '📞', accent: '#0ea5e9', fields: [...commonCustomer, { name: 'epic', label: 'EPIC Number', required: true }] },
  { id: 'ration-aadhaar', title: 'Ration To Aadhaar', category: 'Print Portal', description: 'Ration card and Aadhaar linking assistance.', fee: 100, commission: 15, icon: '🍚', accent: '#22c55e', fields: [...aadhaarBase, { name: 'rationNumber', label: 'Ration Card Number', required: true }, { name: 'document', label: 'Ration Card Document', type: 'file', required: true, col: 2 }] },
  { id: 'up-ration', title: 'UP Ration To Aadhaar', category: 'Print Portal', description: 'UP ration card and Aadhaar linking assistance.', fee: 100, commission: 15, icon: '🪪', accent: '#16a34a', fields: [...aadhaarBase, { name: 'rationNumber', label: 'Ration Card Number', required: true }, { name: 'document', label: 'Ration Card Document', type: 'file', required: true, col: 2 }] },
  { id: 'shopping-b2b', title: 'B2B Wholesale Shopping', category: 'B2B Wholesale', description: 'Wholesale order request for retailers.', fee: 0, commission: 0, icon: '📦', accent: '#f43f5e', badge: 'Active', fields: [{ name: 'product', label: 'Product / SKU', required: true }, { name: 'quantity', label: 'Quantity', type: 'number', required: true }, { name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: true, col: 2 }] },
  { id: 'affiliate', title: 'Affiliate Partner Services', category: 'Affiliate Hub', description: 'Affiliate onboarding and partner support.', fee: 0, commission: 0, icon: '🤝', accent: '#d946ef', fields: [...commonCustomer, { name: 'partnerType', label: 'Partner Type', type: 'select', options: ['Retailer', 'Affiliate', 'Distributor', 'Other'], required: true }, { name: 'message', label: 'Requirement', type: 'textarea', required: true, col: 2 }] },
  { id: 'digital-saas', title: 'Digital SaaS Services', category: 'Digital SaaS', description: 'Business SaaS setup and digital automation request.', fee: 499, commission: 50, icon: '💻', accent: '#7c3aed', fields: [...commonCustomer, { name: 'businessName', label: 'Business Name', required: true }, { name: 'requirement', label: 'Requirement', type: 'textarea', required: true, col: 2 }] },
  { id: 'travel-booking', title: 'Travel Booking', category: 'Travel Bookings', description: 'Travel booking assistance request.', fee: 100, commission: 10, icon: '✈️', accent: '#0284c7', fields: [...commonCustomer, { name: 'from', label: 'From', required: true }, { name: 'to', label: 'To', required: true }, { name: 'travelDate', label: 'Travel Date', type: 'date', required: true }, { name: 'passengers', label: 'Passengers', type: 'number', required: true }] },
];

export const serviceCategories = Array.from(new Set(allServices.map(s => s.category)));
