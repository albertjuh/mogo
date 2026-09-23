// Strings for the Fleet page (src/app/fleet/page.tsx) and the shared Rider
// onboarding/edit form (src/components/rider-form.tsx), which is fleet-domain.
export const fleet: { en: Record<string, string>; sw: Record<string, string> } = {
  en: {
    "fleet.unauthorized": "Unauthorized Access",

    // Page header
    "fleet.title": "Bajaji Fleet",
    "fleet.subtitle": "Manage riders and hire-purchase contracts.",

    // Empty state
    "fleet.empty.title": "Your fleet is empty!",
    "fleet.empty.description": "Add your first rider to get started.",
    "fleet.empty.addRider": "Add Rider",

    // Rider card
    "fleet.card.vehicle": "Vehicle",
    "fleet.card.dailyFee": "Daily Fee",
    "fleet.card.guarantor": "Guarantor: {name}",
    "fleet.card.notAvailable": "N/A",
    "fleet.card.viewMkataba": "View Mkataba",

    // Balance badge
    "fleet.balance.debt": "Debt",
    "fleet.balance.credit": "Overdraft/Credit",
    "fleet.balance.current": "Current",

    // Dropdown menu
    "fleet.menu.editProfile": "Edit Profile",
    "fleet.menu.viewContract": "View Contract",

    // Onboarding/Edit dialog
    "fleet.dialog.editRider": "Edit Rider",
    "fleet.dialog.newOnboarding": "New Onboarding",
    "fleet.dialog.recruitmentDataCollection": "Recruitment Data Collection",

    // Contract preview modal
    "fleet.contract.dialogTitle": "Mkataba wa Makabidhiano",
    "fleet.contract.previewFor": "Legal Document Preview • {name}",
    "fleet.contract.docHeader": "BAJAJI HANDOVER (HIRE-PURCHASE) CONTRACT",

    "fleet.contract.ownerNameLabel": "OWNER'S NAME:",
    "fleet.contract.recipientNameLabel": "RECIPIENT'S NAME:",
    "fleet.contract.registrationNoLabel": "REGISTRATION NUMBER:",
    "fleet.contract.vehicleTypeLabel": "VEHICLE TYPE:",
    "fleet.contract.modelNumberLabel": "MODEL NUMBER:",
    "fleet.contract.chassisNumberLabel": "CHASSIS NUMBER:",
    "fleet.contract.engineNumberLabel": "ENGINE NUMBER:",
    "fleet.contract.engineCapacityLabel": "ENGINE CAPACITY:",

    "fleet.contract.ownerClauseTitle": "BAJAJI OWNER:",
    "fleet.contract.ownerClause": "I, King Bariki, on {date}, hereby hand over to Mr/Mrs {name} the property described above, of my own free will and sound mind, without having been advised by any other person, and we have agreed that he/she shall pay us the sum of Shillings 10,000 per day [payment arrangement: Tsh 100,000 every 10th day] for a period of {term} months. This contract runs from {date} until {endDate}. At the end of this contract the bajaji shall become his/her property and he/she shall be issued with the bajaji's registration card.",

    "fleet.contract.recipientClauseTitle": "BAJAJI RECIPIENT:",
    "fleet.contract.recipientClause": "I, {name}, being of sound mind and of my own free will, without having been forced or persuaded by anyone, agree to receive the bajaji described above from King Bariki, today, from {date} until {endDate}. I attach a copy of my voter's ID / national ID card / passport photo.",

    "fleet.contract.termsTitle": "CONTRACT TERMS:",
    "fleet.contract.term1": "The vehicle must be brought to the owner at the end of every month so that he can inspect it and confirm its safety.",
    "fleet.contract.term2": "The vehicle must always be serviced and maintained so that it remains in good condition.",
    "fleet.contract.term3": "It is forbidden to lend or hand over this vehicle to any other person for the entire duration of the contract.",
    "fleet.contract.term4": "A sum of Shillings 100,000/= must be repaid every 10th day.",
    "fleet.contract.term5": "Breaking or violating any term of this contract shall be considered a breach of the contract by that party.",
    "fleet.contract.term6": "The vehicle must be returned every Sunday for a weekly inspection and to be granted clearance to continue being used.",
    "fleet.contract.term7": "It is forbidden to use this vehicle outside the permitted district boundaries without written permission from the owner.",
    "fleet.contract.term8": "The driver is responsible for ensuring compliance with all road traffic laws and for paying any fines arising from violations of those laws.",

    "fleet.contract.breachTitle": "BREACH OF CONTRACT (RECIPIENT):",
    "fleet.contract.breachClause": "I, {name}, if I breach this agreement, including failing to pay the sum of Shillings 10,000 per day for more than 3 (three) days without justifiable reason, shall be deemed to have breached my own contract, and I shall be ready to pay them all the money owed to them and to return their vehicle to them in good condition.",

    "fleet.contract.guarantorTitle": "GUARANTOR:",
    "fleet.contract.guarantorClause": "I, {guarantorName}, being of sound mind and without being forced, agree to act as guarantor for {name} before the chairperson, the owner, and his/her witness, and I agree to be held responsible and to pay compensation should he/she lose, damage, or abscond with this vehicle, or should he/she fail to pay any amount owed within 14 days of the event.",

    "fleet.contract.role.owner": "Bajaji Owner",
    "fleet.contract.role.ownerWitness": "Owner's Witness",
    "fleet.contract.role.recipient": "Bajaji Recipient",
    "fleet.contract.role.guarantor": "Guarantor",
    "fleet.contract.label.name": "Name:",
    "fleet.contract.label.signature": "Signature:",

    // Toasts
    "fleet.toast.riderDeleted.title": "Rider Deleted",
    "fleet.toast.riderDeleted.description": "{name} has been removed from your fleet.",
    "fleet.toast.riderUpdated.title": "Rider Updated",
    "fleet.toast.riderUpdated.description": "{name}'s details have been saved.",
    "fleet.toast.riderAdded.title": "Rider Added",
    "fleet.toast.riderAdded.description": "{name} is now part of your fleet.",

    // Delete confirmation
    "fleet.deleteDialog.title": "Are you absolutely sure?",
    "fleet.deleteDialog.description": "This action cannot be undone. This will permanently remove {name} from the fleet.",

    // Rider form
    "fleet.form.tab.basic": "Basic",
    "fleet.form.tab.bajaji": "Bajaji",
    "fleet.form.tab.legal": "Legal",

    "fleet.form.label.fullName": "Full Name (Jina la Mpangaji)",
    "fleet.form.label.email": "Email Address (Barua Pepe)",
    "fleet.form.label.phone": "Phone (Namba ya Simu)",
    "fleet.form.label.idNumber": "ID / Shahidi Number",
    "fleet.form.label.vehicleType": "Vehicle Type (Chombo)",
    "fleet.form.label.plateNumber": "Plate Number (Usajili)",
    "fleet.form.label.model": "Model / Type",
    "fleet.form.label.capacity": "Capacity (CC)",
    "fleet.form.label.chassisNo": "Chassis No.",
    "fleet.form.label.engineNo": "Engine No.",
    "fleet.form.label.dailyFee": "Daily Fee (TZS)",
    "fleet.form.label.frequency": "Frequency",
    "fleet.form.label.startDate": "Start Date",
    "fleet.form.label.termMonths": "Term (Months)",
    "fleet.form.label.guarantorName": "Full Name",
    "fleet.form.label.witnessName": "Witness Name",
    "fleet.form.label.witnessPhone": "Witness Phone",

    "fleet.form.section.guarantor": "Guarantor (Mdhamini)",
    "fleet.form.section.witness": "Witness (Shahidi)",

    "fleet.form.placeholder.name": "Juma Hassan",
    "fleet.form.placeholder.email": "rider@email.com",
    "fleet.form.placeholder.phone": "0712345678",
    "fleet.form.placeholder.idNumber": "NIDA / Voter ID",
    "fleet.form.placeholder.selectType": "Select type",
    "fleet.form.placeholder.plateNumber": "T 123 BCD",
    "fleet.form.placeholder.model": "Boxer 150",
    "fleet.form.placeholder.capacity": "150cc",
    "fleet.form.placeholder.chassis": "MC...",
    "fleet.form.placeholder.engine": "ENG...",
    "fleet.form.placeholder.frequency": "Frequency",
    "fleet.form.placeholder.pickDate": "Pick",
    "fleet.form.placeholder.guarantorName": "Guarantor Name",
    "fleet.form.placeholder.genericPhone": "07...",
    "fleet.form.placeholder.witnessName": "Witness Name",

    "fleet.form.select.bajaji": "Bajaji",
    "fleet.form.select.daily": "Daily",
    "fleet.form.select.weekly": "Weekly",
    "fleet.form.select.every10Days": "Every 10 Days",

    "fleet.form.button.saveChanges": "Save Changes",
    "fleet.form.button.confirmOnboarding": "Confirm Onboarding",
  },
  sw: {
    "fleet.unauthorized": "Huna Ruhusa ya Kuingia",

    // Page header
    "fleet.title": "Meli ya Bajaji",
    "fleet.subtitle": "Simamia madereva na mikataba ya makabidhiano.",

    // Empty state
    "fleet.empty.title": "Meli yako haina dereva bado!",
    "fleet.empty.description": "Ongeza dereva wako wa kwanza ili kuanza.",
    "fleet.empty.addRider": "Ongeza Dereva",

    // Rider card
    "fleet.card.vehicle": "Chombo",
    "fleet.card.dailyFee": "Ada ya Kila Siku",
    "fleet.card.guarantor": "Mdhamini: {name}",
    "fleet.card.notAvailable": "Haipo",
    "fleet.card.viewMkataba": "Angalia Mkataba",

    // Balance badge
    "fleet.balance.debt": "Deni",
    "fleet.balance.credit": "Ziada/Malipo ya Ziada",
    "fleet.balance.current": "Salama",

    // Dropdown menu
    "fleet.menu.editProfile": "Hariri Wasifu",
    "fleet.menu.viewContract": "Angalia Mkataba",

    // Onboarding/Edit dialog
    "fleet.dialog.editRider": "Hariri Dereva",
    "fleet.dialog.newOnboarding": "Usajili Mpya",
    "fleet.dialog.recruitmentDataCollection": "Ukusanyaji wa Takwimu za Usajili",

    // Contract preview modal
    "fleet.contract.dialogTitle": "Mkataba wa Makabidhiano",
    "fleet.contract.previewFor": "Mapitio ya Hati ya Kisheria • {name}",
    "fleet.contract.docHeader": "MKATABA WA MAKABIDHIANO YA BAJAJI",

    "fleet.contract.ownerNameLabel": "JINA LA MMILIKI:",
    "fleet.contract.recipientNameLabel": "JINA LA ANAEKABIDHIWA:",
    "fleet.contract.registrationNoLabel": "NAMBA YA USAJILI:",
    "fleet.contract.vehicleTypeLabel": "AINA YA CHOMBO:",
    "fleet.contract.modelNumberLabel": "MODEL NUMBER:",
    "fleet.contract.chassisNumberLabel": "CHASSIS NUMBER:",
    "fleet.contract.engineNumberLabel": "ENGINE NUMBER:",
    "fleet.contract.engineCapacityLabel": "ENGINE CAPACITY:",

    "fleet.contract.ownerClauseTitle": "MMILIKI WA BAJAJI:",
    "fleet.contract.ownerClause": "Mimi King Bariki tarehe {date} nimemkabidhi ndugu {name} Mali iliyotajwa hapo juu kwa hiari yangu mwenyewe nikiwa na akili zangu timamu bila kushauriwa na mtu yeyote, na tumekubaliana atulipe kiasi cha shilingi 10,000 kwa siku [utaratibu wa malipo ni Tsh 100,000 kila siku ya 10] kwa mda wa miezi {term}. Mkataba huu ni kuanzia tarehe {date} hadi tarehe {endDate} Itakuwa mwisho wa mkataba huu na bajaji itakuwa ni mali yake na atakabidhiwa kadi ya bajaji.",

    "fleet.contract.recipientClauseTitle": "ANAEKABIDHIWA BAJAJI:",
    "fleet.contract.recipientClause": "Mimi {name} nikiwa na akili zangu timamu na kwa hiari yangu mwenyewe bila kulazimishwa na mtu yeyote wala kushawishiwa nimekubali kupokea bajaji tajwa hapo juu kutoka kwa King Bariki leo tarehe {date} hadi tarehe {endDate}. Na ninaambatanisha nakala ya kitambulisho changu cha mpiga kura/kitambulisho cha taifa/picha ya passport.",

    "fleet.contract.termsTitle": "MASHARTI YA MKATABA:",
    "fleet.contract.term1": "Ni lazima kuleta chombo kila mwisho wa mwezi kwa mwenye mali ili aione kuhakikisha usalama wa chombo chake.",
    "fleet.contract.term2": "Ni lazima kuhakikisha chombo inafanyiwa matengenezo (service) kila wakati ili iendelee kubaki kwenye ubora.",
    "fleet.contract.term3": "Ni marufuku kumwazima/kumpa mtu yoyote chombo hiki ndani ya kipindi chote cha mkataba.",
    "fleet.contract.term4": "Ni lazima kurejesha kiasi cha shilingi 100,000/= kila siku ya 10.",
    "fleet.contract.term5": "Kuvunja/kukiuka sharti lolote la mkataba huu utakuwa umevunja mkataba mwenyewe.",
    "fleet.contract.term6": "Chombo lazima irudishwe kila siku ya Jumapili kwa ukaguzi wa wiki na kupatiwa kibali cha kuendelea kutumika.",
    "fleet.contract.term7": "Ni marufuku kutumia chombo hiki nje ya mipaka ya wilaya iliyoruhusiwa bila ruhusa ya maandishi kutoka kwa mmiliki.",
    "fleet.contract.term8": "Dereva ana wajibu wa kuhakikisha anafuata sheria zote za barabarani na kulipa faini zozote zitakazotokana na ukiukwaji wa sheria.",

    "fleet.contract.breachTitle": "KUVUNJA MKATABA (ANAEKABIDHIWA):",
    "fleet.contract.breachClause": "Mimi {name} endapo nitavunja makubaliano haya ikiwa ni pamoja na kushindwa kulipa kiasi cha shilingi 10,000 kwa siku kwa kupitiliza siku 3 (tatu) kwa sababu zisizo za msingi nitakuwa nimevunja mkataba wangu mwenyewe na nitakuwa tayari kuwalipa ela yao yote wanayonidai na kuwakabidhi chombo chao kikiwa katika hali nzuri.",

    "fleet.contract.guarantorTitle": "MDHAMINI:",
    "fleet.contract.guarantorClause": "Mimi {guarantorName} nikiwa na akili zangu timamu bila kulazimishwa nakubali kumdhamini {name} mbele ya mwenyekiti, mwenye mali na shahidi wake na nakubali kuwajibika na kulipa fidia endapo atapoteza/ataaribu/atakimbia na chombo hiki au atashindwa kulipa kiasi chochote atakachokuwa anadaiwa ndani ya siku 14 za tukio.",

    "fleet.contract.role.owner": "Mmiliki wa bajaji",
    "fleet.contract.role.ownerWitness": "Shahidi wa mmiliki",
    "fleet.contract.role.recipient": "Aliekabidhiwa bajaji",
    "fleet.contract.role.guarantor": "Mdhamini",
    "fleet.contract.label.name": "Jina:",
    "fleet.contract.label.signature": "Sahihi:",

    // Toasts
    "fleet.toast.riderDeleted.title": "Dereva Amefutwa",
    "fleet.toast.riderDeleted.description": "{name} ameondolewa kwenye meli yako.",
    "fleet.toast.riderUpdated.title": "Dereva Amesasishwa",
    "fleet.toast.riderUpdated.description": "Taarifa za {name} zimehifadhiwa.",
    "fleet.toast.riderAdded.title": "Dereva Ameongezwa",
    "fleet.toast.riderAdded.description": "{name} sasa ni sehemu ya meli yako.",

    // Delete confirmation
    "fleet.deleteDialog.title": "Una uhakika kabisa?",
    "fleet.deleteDialog.description": "Kitendo hiki hakiwezi kutenduliwa. Hii itamwondoa {name} kabisa kutoka kwenye meli.",

    // Rider form
    "fleet.form.tab.basic": "Msingi",
    "fleet.form.tab.bajaji": "Bajaji",
    "fleet.form.tab.legal": "Kisheria",

    "fleet.form.label.fullName": "Jina Kamili (Jina la Mpangaji)",
    "fleet.form.label.email": "Barua Pepe (Email)",
    "fleet.form.label.phone": "Namba ya Simu",
    "fleet.form.label.idNumber": "Namba ya Kitambulisho / Shahidi",
    "fleet.form.label.vehicleType": "Aina ya Chombo",
    "fleet.form.label.plateNumber": "Namba ya Usajili",
    "fleet.form.label.model": "Model / Aina",
    "fleet.form.label.capacity": "Uwezo (CC)",
    "fleet.form.label.chassisNo": "Namba ya Chassis",
    "fleet.form.label.engineNo": "Namba ya Injini",
    "fleet.form.label.dailyFee": "Ada ya Kila Siku (TZS)",
    "fleet.form.label.frequency": "Utaratibu wa Malipo",
    "fleet.form.label.startDate": "Tarehe ya Kuanza",
    "fleet.form.label.termMonths": "Muda wa Mkataba (Miezi)",
    "fleet.form.label.guarantorName": "Jina Kamili",
    "fleet.form.label.witnessName": "Jina la Shahidi",
    "fleet.form.label.witnessPhone": "Namba ya Shahidi",

    "fleet.form.section.guarantor": "Mdhamini",
    "fleet.form.section.witness": "Shahidi",

    "fleet.form.placeholder.name": "Juma Hassan",
    "fleet.form.placeholder.email": "dereva@email.com",
    "fleet.form.placeholder.phone": "0712345678",
    "fleet.form.placeholder.idNumber": "NIDA / Kitambulisho cha Mpiga Kura",
    "fleet.form.placeholder.selectType": "Chagua aina",
    "fleet.form.placeholder.plateNumber": "T 123 BCD",
    "fleet.form.placeholder.model": "Boxer 150",
    "fleet.form.placeholder.capacity": "150cc",
    "fleet.form.placeholder.chassis": "MC...",
    "fleet.form.placeholder.engine": "ENG...",
    "fleet.form.placeholder.frequency": "Utaratibu",
    "fleet.form.placeholder.pickDate": "Chagua",
    "fleet.form.placeholder.guarantorName": "Jina la Mdhamini",
    "fleet.form.placeholder.genericPhone": "07...",
    "fleet.form.placeholder.witnessName": "Jina la Shahidi",

    "fleet.form.select.bajaji": "Bajaji",
    "fleet.form.select.daily": "Kila Siku",
    "fleet.form.select.weekly": "Kila Wiki",
    "fleet.form.select.every10Days": "Kila Siku 10",

    "fleet.form.button.saveChanges": "Hifadhi Mabadiliko",
    "fleet.form.button.confirmOnboarding": "Thibitisha Usajili",
  },
};
