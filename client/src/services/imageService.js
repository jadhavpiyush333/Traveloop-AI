import axios from 'axios';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

export const fetchCityImage = async (query) => {
  if (!UNSPLASH_ACCESS_KEY) {
    // Fallback images if no API key is provided to ensure app still looks good
    const fallbacks = {
      "paris": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
      "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
      "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
      "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
      "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
      "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      "london": "https://images.unsplash.com/photo-1513635269975-59693e0cd156",
      "sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
      "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99",
      "rio": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
      "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77ef244",
      "santorini": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
      "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
      "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245",
      "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
      "agra": "https://images.unsplash.com/photo-1564507592224-2fc8c62c3e1b",
      "mumbai": "https://images.unsplash.com/photo-1522253810141-8fbe36340f1a",
      "pune": "https://images.unsplash.com/photo-1565551390457-f10d7a9617d1",
      "nashik": "https://images.unsplash.com/photo-1564056095190-2ee2878ce458",
      "amsterdam": "https://images.unsplash.com/photo-1517736996303-4eec4a66bb17",
      "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047",
      "madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4",
      "vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
      "prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439",
      "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200",
      "cairo": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50",
      "bangkok": "https://images.unsplash.com/photo-1504214208698-ea1916a2195a",
      "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",
      "kuala lumpur": "https://images.unsplash.com/photo-1541355416-04cb50040fb9",
      "seoul": "https://images.unsplash.com/photo-1538485399081-7191377e8241",
      "beijing": "https://images.unsplash.com/photo-1508804052814-cd3ba865a116",
      "hong kong": "https://images.unsplash.com/photo-1506974251486-ffdf95015b6d",
      "los angeles": "https://images.unsplash.com/photo-1515896769750-31548ea11100",
      "las vegas": "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a",
      "miami": "https://images.unsplash.com/photo-1533682805518-48d1f5a8bb38",
      "toronto": "https://images.unsplash.com/photo-1517090504586-fde19ea6066f",
      "vancouver": "https://images.unsplash.com/photo-1559511260-66a654ae982a",
      "buenos aires": "https://images.unsplash.com/photo-1613009579679-b1d7d247fde0",
      "lima": "https://images.unsplash.com/photo-1526392060635-9d60198d10f8",
      "auckland": "https://images.unsplash.com/photo-1506462945848-ac8ea2f609ff",
      "honolulu": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
      "mauritius": "https://images.unsplash.com/photo-1500367215255-0e0b21487ca9",
      "phuket": "https://images.unsplash.com/photo-1537956965359-7573183d1f57",
      "marrakech": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70",
      "hanoi": "https://images.unsplash.com/photo-1559592413-7ce4f52fa4c0",
      "budapest": "https://images.unsplash.com/photo-1549877452-9c387254f158",
      "stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96504443",
      "athens": "https://images.unsplash.com/photo-1555993539-1732b0258235",
      "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      "dubrovnik": "https://images.unsplash.com/photo-1555985202-12975b0235dc",
      "matamata": "https://images.unsplash.com/photo-1500534623283-312aade485b7",
      "petra": "https://images.unsplash.com/photo-1579546059293-13ce37667c29",
      "reykjavik": "https://images.unsplash.com/photo-1476610283083-d021f1d1aa5d",
      "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
      "salzburg": "https://images.unsplash.com/photo-1514886629983-db610ce712a4",
      "edinburgh": "https://images.unsplash.com/photo-1506509533310-74e30b6e9275",
      "wadi rum": "https://images.unsplash.com/photo-1550954397-28f0923e59ea",
      "interlaken": "https://images.unsplash.com/photo-1527668752968-14dc70a27c95"
    };
    
    const key = Object.keys(fallbacks).find(k => query.toLowerCase().includes(k));
    return fallbacks[key] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
  }

  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query, orientation: 'landscape', per_page: 1 },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828"; // default fallback
  } catch (error) {
    console.error("Error fetching image from Unsplash", error);
    // If Unsplash API fails (e.g. rate limit), use the fallback list
    const fallbacks = {
      "paris": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
      "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
      "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
      "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
      "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
      "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
      "london": "https://images.unsplash.com/photo-1513635269975-59693e0cd156",
      "sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
      "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99",
      "rio": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
      "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77ef244",
      "santorini": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
      "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
      "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245",
      "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
      "agra": "https://images.unsplash.com/photo-1564507592224-2fc8c62c3e1b",
      "mumbai": "https://images.unsplash.com/photo-1522253810141-8fbe36340f1a",
      "pune": "https://images.unsplash.com/photo-1565551390457-f10d7a9617d1",
      "nashik": "https://images.unsplash.com/photo-1564056095190-2ee2878ce458",
      "amsterdam": "https://images.unsplash.com/photo-1517736996303-4eec4a66bb17",
      "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047",
      "madrid": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4",
      "vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af",
      "prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439",
      "istanbul": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200",
      "cairo": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50",
      "bangkok": "https://images.unsplash.com/photo-1504214208698-ea1916a2195a",
      "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",
      "kuala lumpur": "https://images.unsplash.com/photo-1541355416-04cb50040fb9",
      "seoul": "https://images.unsplash.com/photo-1538485399081-7191377e8241",
      "beijing": "https://images.unsplash.com/photo-1508804052814-cd3ba865a116",
      "hong kong": "https://images.unsplash.com/photo-1506974251486-ffdf95015b6d",
      "los angeles": "https://images.unsplash.com/photo-1515896769750-31548ea11100",
      "las vegas": "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a",
      "miami": "https://images.unsplash.com/photo-1533682805518-48d1f5a8bb38",
      "toronto": "https://images.unsplash.com/photo-1517090504586-fde19ea6066f",
      "vancouver": "https://images.unsplash.com/photo-1559511260-66a654ae982a",
      "buenos aires": "https://images.unsplash.com/photo-1613009579679-b1d7d247fde0",
      "lima": "https://images.unsplash.com/photo-1526392060635-9d60198d10f8",
      "auckland": "https://images.unsplash.com/photo-1506462945848-ac8ea2f609ff",
      "honolulu": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8",
      "mauritius": "https://images.unsplash.com/photo-1500367215255-0e0b21487ca9",
      "phuket": "https://images.unsplash.com/photo-1537956965359-7573183d1f57",
      "marrakech": "https://images.unsplash.com/photo-1539020140153-e479b8c22e70",
      "hanoi": "https://images.unsplash.com/photo-1559592413-7ce4f52fa4c0",
      "budapest": "https://images.unsplash.com/photo-1549877452-9c387254f158",
      "stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96504443",
      "athens": "https://images.unsplash.com/photo-1555993539-1732b0258235",
      "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
      "dubrovnik": "https://images.unsplash.com/photo-1555985202-12975b0235dc",
      "matamata": "https://images.unsplash.com/photo-1500534623283-312aade485b7",
      "petra": "https://images.unsplash.com/photo-1579546059293-13ce37667c29",
      "reykjavik": "https://images.unsplash.com/photo-1476610283083-d021f1d1aa5d",
      "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
      "salzburg": "https://images.unsplash.com/photo-1514886629983-db610ce712a4",
      "edinburgh": "https://images.unsplash.com/photo-1506509533310-74e30b6e9275",
      "wadi rum": "https://images.unsplash.com/photo-1550954397-28f0923e59ea",
      "interlaken": "https://images.unsplash.com/photo-1527668752968-14dc70a27c95"
    };
    const key = Object.keys(fallbacks).find(k => query.toLowerCase().includes(k));
    return fallbacks[key] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
  }
};
