import axios from 'axios';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

const imageCache = new Map();

// Comprehensive fallbacks: cities + their most famous landmarks
// Each key is matched via substring against the query (longest match wins)
const fallbacks = {
  // ─── CITIES ───────────────────────────────────────────────
  "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200",
  "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200",
  "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200",
  "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200",
  "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200",
  "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200",
  "sydney": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200",
  "santorini": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200",
  "barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200",
  "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200",
  "amsterdam": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200",
  "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200",
  "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200",
  "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200",
  "agra": "https://images.unsplash.com/photo-1564507592333-c60657451ddc?auto=format&fit=crop&w=1200",
  "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200",
  "pune": "https://images.unsplash.com/photo-1572782252655-9c8771392601?auto=format&fit=crop&w=1200",
  "nashik": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200",
  "cape town": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200",
  "rio de janeiro": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200",
  "rio": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200",
  "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200",
  "madrid": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200",
  "vienna": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200",
  "prague": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200",
  "istanbul": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200",
  "cairo": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200",
  "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200",
  "kuala lumpur": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200",
  "seoul": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200",
  "beijing": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200",
  "hong kong": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200",
  "los angeles": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=1200",
  "las vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1200",
  "miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1200",
  "toronto": "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1200",
  "vancouver": "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1200",
  "buenos aires": "https://images.unsplash.com/photo-1588014608829-fb26fd3751b2?auto=format&fit=crop&w=1200",
  "lima": "https://images.unsplash.com/photo-1531968455001-5c5277a9b132?auto=format&fit=crop&w=1200",
  "auckland": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200",
  "honolulu": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
  "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200",
  "mauritius": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200",
  "phuket": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200",
  "marrakech": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200",
  "hanoi": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200",
  "budapest": "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200",
  "stockholm": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200",
  "athens": "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200",
  "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200",
  "dubrovnik": "https://images.unsplash.com/photo-1555990538-1670cdacb5a5?auto=format&fit=crop&w=1200",
  "hobbiton": "https://images.unsplash.com/photo-1570698473886-411e07faa011?auto=format&fit=crop&w=1200",
  "matamata": "https://images.unsplash.com/photo-1570698473886-411e07faa011?auto=format&fit=crop&w=1200",
  "petra": "https://images.unsplash.com/photo-1579606032821-4e6161c81571?auto=format&fit=crop&w=1200",
  "reykjavik": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200",
  "venice": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200",
  "salzburg": "https://images.unsplash.com/photo-1609881822655-771c89e61a0e?auto=format&fit=crop&w=1200",
  "edinburgh": "https://images.unsplash.com/photo-1506377215351-460b64d1f211?auto=format&fit=crop&w=1200",
  "wadi rum": "https://images.unsplash.com/photo-1553899017-01ec5e04c6b9?auto=format&fit=crop&w=1200",
  "interlaken": "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200",

  // ─── FAMOUS LANDMARKS (for PPT place-specific slides) ────
  // Paris
  "eiffel tower": "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=1200",
  "louvre": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200",
  "notre dame": "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?auto=format&fit=crop&w=1200",
  // Bali
  "ubud": "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200",
  "seminyak": "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=1200",
  "nusa penida": "https://images.unsplash.com/photo-1570789210967-2cac24f4d914?auto=format&fit=crop&w=1200",
  // Tokyo
  "shibuya": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200",
  "senso-ji": "https://images.unsplash.com/photo-1583766395091-2eb9994ed094?auto=format&fit=crop&w=1200",
  "tokyo skytree": "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200",
  // New York
  "statue of liberty": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200",
  "central park": "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200",
  "times square": "https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?auto=format&fit=crop&w=1200",
  // Rome
  "colosseum": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200",
  "pantheon": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200",
  "vatican": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1200",
  // Dubai
  "burj khalifa": "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=1200",
  "dubai mall": "https://images.unsplash.com/photo-1558452919-08ae4aea8e29?auto=format&fit=crop&w=1200",
  "palm jumeirah": "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=1200",
  // London
  "london eye": "https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1200",
  "tower bridge": "https://images.unsplash.com/photo-1471874708433-acd480424946?auto=format&fit=crop&w=1200",
  "big ben": "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1200",
  // Sydney
  "opera house": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1200",
  "bondi beach": "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1200",
  "harbour bridge": "https://images.unsplash.com/photo-1524293568345-75d62c3664f7?auto=format&fit=crop&w=1200",
  // Cape Town
  "table mountain": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200",
  "robben island": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200",
  // Rio
  "christ the redeemer": "https://images.unsplash.com/photo-1548963670-aaaa8f73a5e3?auto=format&fit=crop&w=1200",
  "copacabana": "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200",
  "sugarloaf": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200",
  // Barcelona
  "sagrada familia": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200",
  "park güell": "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?auto=format&fit=crop&w=1200",
  "gothic quarter": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200",
  // Santorini
  "oia": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200",
  "fira": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1200",
  // Goa
  "baga beach": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200",
  "dudhsagar": "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1200",
  "aguada fort": "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200",
  // Jaipur
  "hawa mahal": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200",
  "amber palace": "https://images.unsplash.com/photo-1599661046289-e31887846e11?auto=format&fit=crop&w=1200",
  "city palace": "https://images.unsplash.com/photo-1524309312675-6f286d05031c?auto=format&fit=crop&w=1200",
  // Kerala
  "munnar": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200",
  "alleppey": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200",
  "wayanad": "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=1200",
  // Agra
  "taj mahal": "https://images.unsplash.com/photo-1564507592333-c60657451ddc?auto=format&fit=crop&w=1200",
  "agra fort": "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200",
  "fatehpur sikri": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200",
  // Mumbai
  "gateway of india": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200",
  "marine drive": "https://images.unsplash.com/photo-1567157577867-05ccb1388e13?auto=format&fit=crop&w=1200",
  "elephanta caves": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200",
  // Pune
  "shaniwar wada": "https://images.unsplash.com/photo-1572782252655-9c8771392601?auto=format&fit=crop&w=1200",
  "aga khan palace": "https://images.unsplash.com/photo-1599030274613-5bb6abb66e07?auto=format&fit=crop&w=1200",
  "sinhagad": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200",
  // Nashik
  "sula vineyards": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200",
  "trimbakeshwar": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200",
  // Amsterdam
  "anne frank": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200",
  "van gogh museum": "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=1200",
  "vondelpark": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200",
  // Berlin
  "brandenburg gate": "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200",
  "berlin wall": "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200",
  "museum island": "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=1200",
  // Madrid
  "prado museum": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200",
  "royal palace": "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200",
  "retiro park": "https://images.unsplash.com/photo-1558370781-d6196949e317?auto=format&fit=crop&w=1200",
  // Vienna
  "schönbrunn": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1200",
  "belvedere palace": "https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?auto=format&fit=crop&w=1200",
  // Prague
  "charles bridge": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1200",
  "prague castle": "https://images.unsplash.com/photo-1562624475-96c2bc08fab9?auto=format&fit=crop&w=1200",
  "old town square": "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200",
  // Istanbul
  "hagia sophia": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200",
  "blue mosque": "https://images.unsplash.com/photo-1570358934836-6802981e481e?auto=format&fit=crop&w=1200",
  "grand bazaar": "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200",
  // Cairo
  "pyramids": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200",
  "giza": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200",
  // Bangkok
  "grand palace": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200",
  "wat arun": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200",
  "chatuchak": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200",
  // Singapore
  "gardens by the bay": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200",
  "marina bay sands": "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=1200",
  "sentosa": "https://images.unsplash.com/photo-1532368971003-e74cdce43257?auto=format&fit=crop&w=1200",
  // Kuala Lumpur
  "petronas": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200",
  "batu caves": "https://images.unsplash.com/photo-1598091283721-fcb81d42e8e9?auto=format&fit=crop&w=1200",
  // Seoul
  "gyeongbokgung": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200",
  "n seoul tower": "https://images.unsplash.com/photo-1541415401-c812b3e2ece2?auto=format&fit=crop&w=1200",
  "myeong-dong": "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?auto=format&fit=crop&w=1200",
  // Beijing
  "great wall": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200",
  "forbidden city": "https://images.unsplash.com/photo-1584450150891-25e31be3d63e?auto=format&fit=crop&w=1200",
  "temple of heaven": "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200",
  // Hong Kong
  "victoria peak": "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1200",
  "disneyland": "https://images.unsplash.com/photo-1597466599360-3b9775841aec?auto=format&fit=crop&w=1200",
  "lantau island": "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200",
  // Los Angeles
  "hollywood": "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=1200",
  "griffith observatory": "https://images.unsplash.com/photo-1515896769750-31548aa180ed?auto=format&fit=crop&w=1200",
  "universal studios": "https://images.unsplash.com/photo-1568454537842-d933259bb258?auto=format&fit=crop&w=1200",
  // Las Vegas
  "the strip": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?auto=format&fit=crop&w=1200",
  "bellagio": "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?auto=format&fit=crop&w=1200",
  "red rock canyon": "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1200",
  // Miami
  "south beach": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1200",
  "art deco": "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=1200",
  "everglades": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200",
  // Toronto
  "cn tower": "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1200",
  "toronto islands": "https://images.unsplash.com/photo-1542704792-e30dac463c90?auto=format&fit=crop&w=1200",
  // Vancouver
  "stanley park": "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=1200",
  "capilano": "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=1200",
  "granville island": "https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=1200",
  // Buenos Aires
  "la boca": "https://images.unsplash.com/photo-1588014608829-fb26fd3751b2?auto=format&fit=crop&w=1200",
  // Honolulu
  "waikiki": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200",
  "diamond head": "https://images.unsplash.com/photo-1573212594287-0d27ecb21b77?auto=format&fit=crop&w=1200",
  "pearl harbor": "https://images.unsplash.com/photo-1546500840-ae38253aba9b?auto=format&fit=crop&w=1200",
  // Phuket
  "patong": "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200",
  "big buddha": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200",
  "phi phi": "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200",
  // Marrakech
  "jemaa el-fnaa": "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200",
  "majorelle garden": "https://images.unsplash.com/photo-1587974928442-77dc3e0748b1?auto=format&fit=crop&w=1200",
  "bahia palace": "https://images.unsplash.com/photo-1548820513-a7a98e1dbacf?auto=format&fit=crop&w=1200",
  // Hanoi
  "hoan kiem": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200",
  "temple of literature": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200",
  // Budapest
  "parliament": "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200",
  "buda castle": "https://images.unsplash.com/photo-1549920867-4d4f163d6abb?auto=format&fit=crop&w=1200",
  "széchenyi": "https://images.unsplash.com/photo-1551867633-194f125bddfa?auto=format&fit=crop&w=1200",
  // Stockholm
  "gamla stan": "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200",
  // Athens
  "acropolis": "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200",
  "parthenon": "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=1200",
  "plaka": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200",
  // Kyoto
  "fushimi inari": "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200",
  "arashiyama": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200",
  "kinkaku": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200",
  // Dubrovnik
  "old town walls": "https://images.unsplash.com/photo-1555990538-1670cdacb5a5?auto=format&fit=crop&w=1200",
  "stradun": "https://images.unsplash.com/photo-1565787929124-7a16736b6773?auto=format&fit=crop&w=1200",
  // Matamata / Hobbiton
  "hobbiton movie set": "https://images.unsplash.com/photo-1570698473886-411e07faa011?auto=format&fit=crop&w=1200",
  "wairere falls": "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?auto=format&fit=crop&w=1200",
  // Petra
  "treasury": "https://images.unsplash.com/photo-1579606032821-4e6161c81571?auto=format&fit=crop&w=1200",
  "al-khazneh": "https://images.unsplash.com/photo-1579606032821-4e6161c81571?auto=format&fit=crop&w=1200",
  "monastery": "https://images.unsplash.com/photo-1568632234153-44e10fb5d2a1?auto=format&fit=crop&w=1200",
  "siq": "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?auto=format&fit=crop&w=1200",
  // Reykjavik
  "blue lagoon": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200",
  "hallgrímskirkja": "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1200",
  "golden circle": "https://images.unsplash.com/photo-1490085338885-f2ed5e9e501e?auto=format&fit=crop&w=1200",
  // Venice
  "st. mark": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200",
  "grand canal": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200",
  "rialto bridge": "https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?auto=format&fit=crop&w=1200",
  // Salzburg
  "hohensalzburg": "https://images.unsplash.com/photo-1609881822655-771c89e61a0e?auto=format&fit=crop&w=1200",
  "mirabell palace": "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200",
  "mozart": "https://images.unsplash.com/photo-1609881822655-771c89e61a0e?auto=format&fit=crop&w=1200",
  // Edinburgh
  "edinburgh castle": "https://images.unsplash.com/photo-1506377215351-460b64d1f211?auto=format&fit=crop&w=1200",
  "royal mile": "https://images.unsplash.com/photo-1562502429-1a18a4571f35?auto=format&fit=crop&w=1200",
  "arthur's seat": "https://images.unsplash.com/photo-1599561046251-bfb9465b4c44?auto=format&fit=crop&w=1200",
  // Wadi Rum
  "lawrence's spring": "https://images.unsplash.com/photo-1553899017-01ec5e04c6b9?auto=format&fit=crop&w=1200",
  "khazali canyon": "https://images.unsplash.com/photo-1553899017-01ec5e04c6b9?auto=format&fit=crop&w=1200",
  // Interlaken
  "jungfraujoch": "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200",
  "lake thun": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200",
  "harder kulm": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200",
  // Maldives
  "maafushi": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200",
  // Mauritius
  "le morne": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200",
  "seven colored earths": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1200",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200";

// Sort keys by length (longest first) so "statue of liberty" matches before "liberty"
const sortedFallbackKeys = Object.keys(fallbacks).sort((a, b) => b.length - a.length);

export const fetchMultiPhoto = async (query, count = 3) => {
  const cacheKey = `multi-${query.toLowerCase()}-${count}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  let refinedQuery = query;
  if (/restaurant|cafe|bistro|deli|bakery|grill|steakhouse/i.test(query)) {
    refinedQuery += " luxury interior food gourmet design";
  } else {
    refinedQuery += " tourism professional photography travel landmark";
  }

  const getFallbacks = (q) => {
    const lowerQ = q.toLowerCase();
    // Try to find the most specific (longest) matching key
    const cityKey = sortedFallbackKeys.find(k => lowerQ.includes(k));
    return cityKey ? [fallbacks[cityKey]] : [DEFAULT_IMAGE];
  };

  if (!UNSPLASH_ACCESS_KEY) {
    const urls = getFallbacks(query);
    imageCache.set(cacheKey, urls);
    return urls;
  }

  try {
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: { query: refinedQuery, orientation: 'landscape', per_page: count },
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });
    
    let urls = response.data.results.map(r => `${r.urls.regular}&auto=format&fit=crop&w=800&q=70`);
    if (urls.length === 0) urls = getFallbacks(query);
    
    imageCache.set(cacheKey, urls);
    return urls;
  } catch (error) {
    console.error("Unsplash Multi-Photo Error:", error);
    return getFallbacks(query);
  }
};

export const fetchCityImage = async (query) => {
  const photos = await fetchMultiPhoto(query, 1);
  return photos[0];
};
