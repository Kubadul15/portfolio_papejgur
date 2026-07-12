module.exports = {
  CREATE_ID_BUTTON_ID: 'create_id_btn',
  CREATE_ID_MODAL_ID: 'create_id_modal',
  SEND_ID_BUTTON_ID: 'send_id_btn',
  CANCEL_ID_BUTTON_ID: 'cancel_id_btn',

  MODAL_FIELD_FULL_NAME: 'full_name',
  MODAL_FIELD_AGE: 'age',
  MODAL_FIELD_CITIZENSHIP: 'citizenship',
  MODAL_FIELD_ROBLOX: 'roblox_username',

  // Panel rejestracji pojazdu. Wymagana rola sprawdzana jest tylko na
  // starcie (nikt nic nie dostaje), a kanal docelowy jest kodowany w
  // customId dalej, tak jak w pozostalych panelach.
  VEHICLE_START_PREFIX: 'vehicle_start',
  VEHICLE_CATEGORY_PREFIX: 'vehicle_category',
  VEHICLE_MODAL_PREFIX: 'vehicle_modal',
  VEHICLE_SEND_PREFIX: 'vehicle_send',
  MODAL_FIELD_VEHICLE_MAKE: 'vehicle_make',
  MODAL_FIELD_VEHICLE_YEAR: 'vehicle_year',
  MODAL_FIELD_VEHICLE_COLOR: 'vehicle_color',
  MODAL_FIELD_VEHICLE_ENGINE: 'vehicle_engine',
  MODAL_FIELD_VEHICLE_OWNER: 'vehicle_owner',
  // Modal pojazdu ma juz maksymalne 5 pol (limit Discorda), wiec numer
  // rejestracyjny podawany recznie przez gracza zbiera osobny, drugi modal.
  // Discord NIE pozwala pokazac modala w odpowiedzi na modal (tylko na
  // komende albo klikniecie przycisku/select menu), wiec miedzy nimi jest
  // jeszcze przycisk VEHICLE_PLATE_START_PREFIX. Dane z pierwszego modala
  // trzymane sa krotko w rejestrze pod losowym pendingId (patrz
  // registry.savePendingVehicle) - customId niesie tylko ten identyfikator.
  VEHICLE_PLATE_START_PREFIX: 'vehicle_plate_start',
  VEHICLE_PLATE_MODAL_PREFIX: 'vehicle_plate_modal',
  MODAL_FIELD_VEHICLE_PLATE: 'vehicle_plate',

  // Panel ticketow. Kategoria i rola obslugi sa zakodowane w customId
  // przycisku startowego, a caly stan konkretnego ticketu (wlasciciel,
  // rola obslugi, kto go przyjal) trzymany jest w temacie kanalu
  // ticketu - dzieki temu klik "Przyjmij"/"Dodaj osobe"/"Zamknij" nie
  // potrzebuje zadnych danych w customId i przetrwa restart bota.
  TICKET_CREATE_PREFIX: 'ticket_create',
  TICKET_MODAL_PREFIX: 'ticket_modal',
  TICKET_CLAIM_BUTTON_ID: 'ticket_claim',
  TICKET_ADD_USER_BUTTON_ID: 'ticket_add_user',
  TICKET_ADD_USER_SELECT_ID: 'ticket_add_user_select',
  TICKET_CLOSE_BUTTON_ID: 'ticket_close',
  MODAL_FIELD_TICKET_REASON: 'ticket_reason',

  // Panel rekrutacji. Kategoria, rola obslugi i opcjonalna rola po
  // akceptacji sa kodowane w customId startu/select menu/modala, a po
  // utworzeniu kanalu podania caly stan (wlasciciel, obie role, status)
  // trzymany jest w temacie kanalu - jak w tickecie, bezstanowo.
  APP_START_PREFIX: 'app_start',
  APP_MIC_SELECT_PREFIX: 'app_mic',
  APP_MODAL_PREFIX: 'app_modal',
  APP_REVIEW_SELECT_ID: 'app_review',
  APP_REJECT_MODAL_ID: 'app_reject_modal',
  MODAL_FIELD_APP_AGE: 'app_age',
  MODAL_FIELD_APP_OTHER_SERVERS: 'app_other_servers',
  MODAL_FIELD_APP_EH_EXPERIENCE: 'app_eh_experience',
  MODAL_FIELD_APP_FOUND_VIA: 'app_found_via',
  MODAL_FIELD_APP_HOURS: 'app_hours',
  MODAL_FIELD_APP_REJECT_REASON: 'app_reject_reason',

  // Panel rejestracji Mafii/Gangu. Kanal docelowy jest kodowany w
  // customId, tak jak w pojezdzie - bez bazy danych.
  MAFIA_START_PREFIX: 'mafia_start',
  MAFIA_SIZE_PREFIX: 'mafia_size',
  MAFIA_MODAL_PREFIX: 'mafia_modal',
  MAFIA_SEND_PREFIX: 'mafia_send',
  MODAL_FIELD_MAFIA_OWNER: 'mafia_owner',
  MODAL_FIELD_MAFIA_COOWNER: 'mafia_coowner',
  MODAL_FIELD_MAFIA_NAME: 'mafia_name',
  MODAL_FIELD_MAFIA_COLOR: 'mafia_color',
  MODAL_FIELD_MAFIA_LOCATION: 'mafia_location',

  // Panel zaloz-dom. Podobnie jak przy pojezdzie: modal ma juz maksymalne
  // 5 pol, wiec dodatkowe szczegoly (powierzchnia/rok/garaz/basen/opis)
  // zbiera drugi modal za posrednictwem przycisku HOUSE_DETAILS_START_PREFIX
  // (Discord nie pozwala pokazac modala w odpowiedzi na modal). Dane z
  // pierwszego modala trzymane sa krotko w rejestrze pod losowym pendingId
  // (registry.savePendingHouse), tak jak w rejestracji pojazdu.
  HOUSE_START_PREFIX: 'house_start',
  HOUSE_CATEGORY_PREFIX: 'house_category',
  HOUSE_MODAL_PREFIX: 'house_modal',
  HOUSE_DETAILS_START_PREFIX: 'house_details_start',
  HOUSE_DETAILS_MODAL_PREFIX: 'house_details_modal',
  HOUSE_SEND_PREFIX: 'house_send',
  MODAL_FIELD_HOUSE_OWNER: 'house_owner',
  MODAL_FIELD_HOUSE_LOCATION: 'house_location',
  MODAL_FIELD_HOUSE_ADDRESS: 'house_address',
  MODAL_FIELD_HOUSE_PRICE: 'house_price',
  MODAL_FIELD_HOUSE_ROOMS: 'house_rooms',
  MODAL_FIELD_HOUSE_AREA: 'house_area',
  MODAL_FIELD_HOUSE_YEAR: 'house_year',
  MODAL_FIELD_HOUSE_GARAGE: 'house_garage',
  MODAL_FIELD_HOUSE_POOL: 'house_pool',
  MODAL_FIELD_HOUSE_DESC: 'house_desc',

  // Panel aukcji domow (/panel aukcja-domow). Rozpoczac aukcje moze tylko
  // config.houseAuctionAdminRoleId, ale licytowac (AUCTION_BID_PREFIX) moze
  // kazdy. Cala zywa aukcja (aktualna najwyzsza oferta, kto licytuje, status)
  // trzymana jest w rejestrze pod krotkim auctionId - embed ogloszenia jest
  // za kazdym razem budowany od nowa z tego stanu, wiec przetrwa restart bota.
  AUCTION_START_PREFIX: 'auction_start',
  AUCTION_MODAL_PREFIX: 'auction_modal',
  AUCTION_BID_PREFIX: 'auction_bid',
  AUCTION_BID_MODAL_PREFIX: 'auction_bid_modal',
  AUCTION_END_PREFIX: 'auction_end',
  MODAL_FIELD_AUCTION_HOUSE: 'auction_house',
  MODAL_FIELD_AUCTION_LOCATION: 'auction_location',
  MODAL_FIELD_AUCTION_PRICE: 'auction_price',
  MODAL_FIELD_AUCTION_INCREMENT: 'auction_increment',
  MODAL_FIELD_AUCTION_DESC: 'auction_desc',
  MODAL_FIELD_AUCTION_BID: 'auction_bid_amount',
};
