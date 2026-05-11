const CHANNELS = [
  { group: "배달", name: "배달의민족", ratio: 0.063, kind: "baemin" },
  { group: "배달", name: "배민원", ratio: 0.4112, kind: "baeminOne" },
  { group: "배달", name: "요기요", ratio: 0.075, kind: "yogiyo" },
  { group: "배달", name: "쿠팡이츠", ratio: 0.3516, kind: "coupang" },
  { group: "배달", name: "지역배달", ratio: 0.032, kind: "local" },
  { group: "배달", name: "자사앱", ratio: 0.0243, kind: "self" },
  { group: "포장", name: "배민 포장", ratio: 0.0123, kind: "pickupBaemin" },
  { group: "포장", name: "쿠팡 포장", ratio: 0.0025, kind: "pickupCoupang" },
  { group: "포장", name: "요기요 포장", ratio: 0.0074, kind: "pickupYogiyo" },
  { group: "포장", name: "지역 포장", ratio: 0.0115, kind: "pickupLocal" },
  { group: "포장", name: "홀 포장", ratio: 0.0082, kind: "hallPickup" },
  { group: "홀", name: "카드매출", ratio: 0.0005, kind: "hallCard" },
  { group: "홀", name: "현금매출", ratio: 0.0005, kind: "cash" },
];

const DEFAULT_REVENUE = {
  monthlySales: 32344100,
  avgOrder: 20000,
  rent: 500000,
  utilities: 705000,
  fullTime: 0,
  partTime: 2.5,
  mode: "hybrid",
};

const DEFAULT_COST = {
  area: 12,
  signType: "flex",
  tableCount: 6,
  mode: "hybrid",
  showWaivedFees: true,
};

function calculatePlatformFee(monthlySales, avgOrder) {
  const orderPrice = Math.max(avgOrder, 1);
  const details = CHANNELS.map((channel) => {
    const sales = monthlySales * channel.ratio;
    const orders = sales / orderPrice;
    let fee = 0;
    if (channel.kind === "baemin") fee = sales * (0.068 + 0.03) * 1.1 + orders * 4000;
    if (channel.kind === "baeminOne") fee = sales * (0.078 + 0.03) * 1.1 + orders * 3400;
    if (channel.kind === "yogiyo") fee = sales * (0.085 + 0.03) * 1.1;
    if (channel.kind === "coupang") fee = sales * (0.078 + 0.03) * 1.1;
    if (channel.kind === "local" || channel.kind === "self") fee = sales * 0.165;
    if (channel.kind === "pickupBaemin") fee = sales * (0.068 + 0.03) * 1.1;
    if (channel.kind === "pickupCoupang") fee = sales * (0.078 + 0.03) * 1.1;
    if (channel.kind === "pickupYogiyo") fee = sales * (0.085 + 0.03) * 1.1;
    if (channel.kind === "pickupLocal") fee = sales * 0.03;
    if (channel.kind === "hallPickup" || channel.kind === "hallCard") fee = sales * 0.00005;
    return { ...channel, sales, orders, fee };
  });
  const quickManagementFee = monthlySales > 0 ? 100000 : 0;
  const total = details.reduce((acc, item) => acc + item.fee, 0) + quickManagementFee;
  return { details, quickManagementFee, total };
}

function calculateRevenue(inputs) {
  const monthlySales = Math.max(0, inputs.monthlySales);
  const logistics = monthlySales * 0.4;
  const platform = calculatePlatformFee(monthlySales, inputs.avgOrder);
  const fullTimeLabor = inputs.fullTime * 2500000 * 1.105;
  const partTimeLabor = inputs.partTime * 3 * 5 * 4.35 * 10030 * 1.2 * 1.105;
  const labor = fullTimeLabor + partTimeLabor;
  const fixed = inputs.rent + inputs.utilities + 400000 + 22000 + 110000;
  const totalCost = logistics + platform.total + labor + fixed;
  const profit = monthlySales - totalCost;
  const margin = monthlySales > 0 ? profit / monthlySales : 0;
  const dailySales = monthlySales / 30.4;
  const monthlyOrders = monthlySales / Math.max(inputs.avgOrder, 1);
  const profitAt = (sales) => {
    const salesPlatform = calculatePlatformFee(sales, inputs.avgOrder);
    const salesLogistics = sales * 0.4;
    return sales - salesLogistics - salesPlatform.total - labor - fixed;
  };
  let low = 0;
  let high = 70000000;
  for (let i = 0; i < 36; i += 1) {
    const mid = (low + high) / 2;
    if (profitAt(mid) >= 0) high = mid;
    else low = mid;
  }
  return { monthlySales, logistics, ingredients: monthlySales * 0.36, packaging: monthlySales * 0.04, platformTotal: platform.total, fullTimeLabor, partTimeLabor, labor, fixed, totalCost, profit, margin, dailySales, monthlyOrders, bepSales: high };
}

function calculateOpeningCost(inputs) {
  const area = Math.max(0, inputs.area);
  const headquartersGross = 2200000 + 1100000 + 300000 * area + 1000000;
  const headquartersDiscount = inputs.showWaivedFees ? headquartersGross : 0;
  const headquartersNet = headquartersGross - headquartersDiscount;
  const interior = area * 1000000;
  const sign = inputs.signType === "flex" ? 700000 : 2000000;
  const internalSigns = 1000000;
  const kitchen = 8000000;
  const utensils = 2100000;
  const seats = inputs.tableCount * 2;
  const hallFurniture = inputs.mode === "hybrid" ? inputs.tableCount * 199650 + seats * 21536 : 0;
  const hallOperatingItems = inputs.mode === "hybrid"
    ? inputs.tableCount * 3 * 2750 + inputs.tableCount * 1210 + inputs.tableCount * 2 * 3850 + inputs.tableCount * 1.5 * 4950 + 5500 + inputs.tableCount * 40955 + inputs.tableCount * 1.5 * 10900 + inputs.tableCount * 2.5 * 1935 + inputs.tableCount * 8247
    : 0;
  const gross = headquartersGross + interior + sign + internalSigns + kitchen + utensils + hallFurniture + hallOperatingItems;
  const net = headquartersNet + interior + sign + internalSigns + kitchen + utensils + hallFurniture + hallOperatingItems;
  const vatGuide = net * 0.1;
  return { area, headquartersGross, headquartersDiscount, headquartersNet, interior, sign, internalSigns, kitchen, utensils, hallFurniture, hallOperatingItems, gross, net, vatGuide, grandTotalWithVatGuide: net + vatGuide, seats };
}

const output = {
  channelRatioTotal: CHANNELS.reduce((sum, item) => sum + item.ratio, 0),
  defaultRevenue: calculateRevenue(DEFAULT_REVENUE),
  defaultOpeningCost: calculateOpeningCost(DEFAULT_COST),
  noWaiverOpeningCost: calculateOpeningCost({ ...DEFAULT_COST, showWaivedFees: false }),
  deliveryOnlyOpeningCost: calculateOpeningCost({ ...DEFAULT_COST, mode: "delivery", tableCount: 0 }),
};
console.log(JSON.stringify(output, null, 2));
