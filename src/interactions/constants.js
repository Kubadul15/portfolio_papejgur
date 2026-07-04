module.exports = {
  CREATE_ID_BUTTON_ID: 'create_id_btn',
  CREATE_ID_MODAL_ID: 'create_id_modal',
  SEND_ID_BUTTON_ID: 'send_id_btn',
  CANCEL_ID_BUTTON_ID: 'cancel_id_btn',

  MODAL_FIELD_FULL_NAME: 'full_name',
  MODAL_FIELD_AGE: 'age',
  MODAL_FIELD_CITIZENSHIP: 'citizenship',
  MODAL_FIELD_ROBLOX: 'roblox_username',

  // Panel weryfikacji Roblox -> rola. ID roli/Roblox/kod sa zakodowane
  // wprost w customId (rozdzielone ':'), zeby nie trzymac zadnego stanu
  // po stronie bota - dziala tez po restarcie bota.
  VERIFY_START_PREFIX: 'verify_start',
  VERIFY_MODAL_PREFIX: 'verify_modal',
  VERIFY_CHECK_PREFIX: 'verify_check',
  MODAL_FIELD_VERIFY_ROBLOX: 'verify_roblox_username',

  // Panel egzaminu na Prawo Jazdy RP. Kanal docelowy, numer pytania
  // i dotychczasowy wynik sa zakodowane w customId przyciskow, a dane
  // kandydata (imie, wiek, Roblox) w embedzie wiadomosci - dzieki temu
  // caly wieloetapowy egzamin jest bezstanowy i przetrwa restart bota.
  EXAM_START_PREFIX: 'exam_start',
  EXAM_CATEGORY_PREFIX: 'exam_category',
  EXAM_MODAL_PREFIX: 'exam_modal',
  EXAM_ANSWER_PREFIX: 'exam_ans',
  EXAM_SEND_PREFIX: 'exam_send',

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
  // customId, tak jak w pojezdzie/prawie jazdy - bez bazy danych.
  MAFIA_START_PREFIX: 'mafia_start',
  MAFIA_SIZE_PREFIX: 'mafia_size',
  MAFIA_MODAL_PREFIX: 'mafia_modal',
  MAFIA_SEND_PREFIX: 'mafia_send',
  MODAL_FIELD_MAFIA_OWNER: 'mafia_owner',
  MODAL_FIELD_MAFIA_COOWNER: 'mafia_coowner',
  MODAL_FIELD_MAFIA_NAME: 'mafia_name',
  MODAL_FIELD_MAFIA_COLOR: 'mafia_color',
  MODAL_FIELD_MAFIA_LOCATION: 'mafia_location',

  // Egzamin wiedzy dla rekrutacji do KMP (/policja rekrutacja). Kategoria i
  // role docelowe podania sa zapisane w rejestrze pod krotkim panelId (patrz
  // registry.savePoliceRecruitmentPanel) - customId niesie tylko ten panelId
  // plus wynik/kolejnosc pytan, zeby zmiescic sie w limicie 100 znakow.
  // Po zdanym egzaminie przycisk koncowy uzywa APP_START_PREFIX (powyzej),
  // dzieki czemu dalej dziala dokladnie ten sam mechanizm co /panel rekrutacja.
  POLICE_EXAM_START_PREFIX: 'police_exam_start',
  POLICE_EXAM_ANSWER_PREFIX: 'police_exam_ans',

  // Osobna, lzejsza rekrutacja do WRD (Wydzial Ruchu Drogowego) w ramach
  // KMP - ten sam mechanizm co powyzej (panelId z rejestru, handoff do
  // APP_START_PREFIX po zdaniu), ale z innym, prostszym pytaniom.
  WRD_EXAM_START_PREFIX: 'wrd_exam_start',
  WRD_EXAM_ANSWER_PREFIX: 'wrd_exam_ans',
};
