// Provinces and Emirates data for specific countries
export const provincesData = {
  EG: {
    name: 'Egypt',
    fieldName: 'Province',
    options: [
      { value: 'Cairo', label: 'Cairo' },
      { value: 'Giza', label: 'Giza' },
      { value: 'Alexandria', label: 'Alexandria' },
      { value: 'Dakahlia', label: 'Dakahlia' },
      { value: 'Sharqia', label: 'Sharqia' },
      { value: 'Qalyubia', label: 'Qalyubia' },
      { value: 'Gharbia', label: 'Gharbia' },
      { value: 'Monufia', label: 'Monufia' },
      { value: 'Beheira', label: 'Beheira' },
      { value: 'Kafr el-Sheikh', label: 'Kafr el-Sheikh' },
      { value: 'Damietta', label: 'Damietta' },
      { value: 'Port Said', label: 'Port Said' },
      { value: 'Ismailia', label: 'Ismailia' },
      { value: 'Suez', label: 'Suez' },
      { value: 'North Sinai', label: 'North Sinai' },
      { value: 'South Sinai', label: 'South Sinai' },
      { value: 'Red Sea', label: 'Red Sea' },
      { value: 'New Valley', label: 'New Valley' },
      { value: 'Matrouh', label: 'Matrouh' },
      { value: 'Luxor', label: 'Luxor' },
      { value: 'Aswan', label: 'Aswan' },
      { value: 'Qena', label: 'Qena' },
      { value: 'Sohag', label: 'Sohag' },
      { value: 'Asyut', label: 'Asyut' },
      { value: 'Minya', label: 'Minya' },
      { value: 'Beni Suef', label: 'Beni Suef' },
      { value: 'Fayyum', label: 'Fayyum' }
    ]
  },
  AE: {
    name: 'United Arab Emirates',
    fieldName: 'Emirate',
    options: [
      { value: 'Abu Dhabi', label: 'Abu Dhabi' },
      { value: 'Dubai', label: 'Dubai' },
      { value: 'Sharjah', label: 'Sharjah' },
      { value: 'Ajman', label: 'Ajman' },
      { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
      { value: 'Fujairah', label: 'Fujairah' },
      { value: 'Umm Al Quwain', label: 'Umm Al Quwain' }
    ]
  },
  SA: {
    name: 'Saudi Arabia',
    fieldName: 'Province',
    options: [],
    hideProvince: true // This country doesn't use province field
  }
};

export const getProvincesForCountry = (countryCode) => {
  return provincesData[countryCode] || null;
};

export const getProvinceFieldName = (countryCode) => {
  const countryData = provincesData[countryCode];
  return countryData ? countryData.fieldName : 'Province';
};

export const shouldHideProvince = (countryCode) => {
  const countryData = provincesData[countryCode];
  return countryData ? countryData.hideProvince : false;
};
