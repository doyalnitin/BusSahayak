from gtts import gTTS
import os

os.makedirs("./bus_sahayak_hindi_full", exist_ok=True)

all_sentences = [
    # 1. ONBOARDING
    "Namaste, Bus Sahayak mein swagat hai. Yeh voice-first bus booking app hai.",
    "Is app mein aap sirf awaaz se bus ticket book kar sakte hain.",
    "Screen ko dabakar awaaz se bol sakte hain. Double tap karke chun sakte hain. Triple tap karke ghar ja sakte hain.",
    "Ek number bolkar option chunein. Jaise, ek, do, teen.",
    "Chaliye, aapki pehli booking shuru karte hain.",

    # 2. HOME SCREEN
    "Ghar ki screen. Aapke paas chaar vikalp hain.",
    "Vikalp ek. Bus Dhundhein. Naye bus ke liye tickets khojein aur book karein.",
    "Vikalp do. Meri Bookings. Apne tickets aur PNR status dekhein.",
    "Vikalp teen. Bus Track karein. Apni bus ki live location dekhein.",
    "Vikalp chaar. Madad. App ke baare mein jankari aur sahayata.",
    "Kisi bhi vikalp ko chunne ke liye uska number bolein. Jaise, ek, do, teen, ya chaar.",
    "Screen ko dabakar sabhi vikalpon ko sun sakte hain.",
    "Ghar par wapas jaane ke liye ghar bolein ya triple tap karein.",

    # 3. SEARCH SCREEN - FROM CITY
    "Khoj screen. Pehle batayein aap kahan se jaana chahte hain.",
    "Vikalp ek. Mumbai se.",
    "Vikalp do. Delhi se.",
    "Vikalp teen. Pune se.",
    "Vikalp chaar. Bangalore se.",
    "Vikalp paanch. Jaipur se.",
    "Vikalp che. Hyderabad se.",
    "Vikalp saat. Chennai se.",
    "Vikalp aath. Kolkata se.",
    "Vikalp nau. Ahmedabad se.",
    "Vikalp das. Anya shehar. Apna shehar ka naam bolein.",
    "Shehar ka number bolein ya seedhe naam bolein.",

    # 4. SEARCH SCREEN - TO CITY
    "Ab batayein aap kahan jaana chahte hain.",
    "Vikalp ek. Mumbai tak.",
    "Vikalp do. Delhi tak.",
    "Vikalp teen. Pune tak.",
    "Vikalp chaar. Bangalore tak.",
    "Vikalp paanch. Jaipur tak.",
    "Vikalp che. Hyderabad tak.",
    "Vikalp saat. Chennai tak.",
    "Vikalp aath. Kolkata tak.",
    "Vikalp nau. Ahmedabad tak.",
    "Vikalp das. Anya shehar. Apna shehar ka naam bolein.",
    "Dono cities set ho gayi. Ab buses dhundne ke liye khoj bolein.",

    # 5. RESULTS SCREEN - BUS OPTIONS
    "Mumbai se Pune ke liye paanch buses mili.",
    "Bus ek. VRL Travels. AC Sleeper. Raat das baje nikalti hai. Kiraya aath sau rupaye.",
    "Bus do. Neeta Travels. Volvo AC. Raat gyara bajees baje nikalti hai. Kiraya chhe sau pachas rupaye.",
    "Bus teen. MSRTC Shivneri. AC Seater. Subah chhe baje nikalti hai. Kiraya chaar sau pachas rupaye.",
    "Bus chaar. Paulo Travels. Non-AC Sleeper. Raat nau baje nikalti hai. Kiraya paanch sau rupaye.",
    "Bus paanch. RedBus Express. AC Seater. Subah aath baje nikalti hai. Kiraya paanch sau pachas rupaye.",
    "Bus chunne ke liye uska number bolein. Ek, do, teen, chaar, ya paanch.",
    "Sabhi buses ko dobara sunne ke liye padhein bolein.",
    "Sasta bus dhundne ke liye sasta bolein.",
    "Tez bus dhundne ke liye tez bolein.",
    "Wapas jaane ke liye wapas bolein.",

    # 6. BUS DETAILS
    "VRL Travels ki jaankari. AC Sleeper bus. Das seats bachi hain. Rating char point paanch.",
    "Boarding point. Mumbai Dadar TT Circle.",
    "Dropping point. Pune Station Road.",
    "Yatra ka samay. Char ghante.",
    "WiFi, kambal, paani ki botal milti hai.",
    "Cancellation. Char ghante pehle tak muft hai.",
    "Neeta Travels ki jaankari. Volvo AC bus. Chhees seats bachi hain. Rating char point teen.",
    "Boarding point. Mumbai Kurla Station.",
    "Dropping point. Pune Swargate.",
    "Yatra ka samay. Saadhe char ghante.",
    "Paani ki botal, kambal, charging point milta hai.",
    "Cancellation. Do ghante pehle tak muft hai.",
    "MSRTC Shivneri ki jaankari. AC Seater bus. Aath seats bachi hain. Rating char point do.",
    "Boarding point. Mumbai Mumbai Central.",
    "Dropping point. Pune Kothrud Depot.",
    "Yatra ka samay. Saadhe char ghante.",
    "Paani ki botal, charging point milta hai.",
    "Cancellation. Ghanta bhar pehle tak muft hai.",

    # 7. SEAT SELECTION
    "Seat selection screen. Apni seat chunein.",
    "Upar ki deck. Rows ek se chaar.",
    "Neeche ki deck. Rows paanch se das.",
    "Uplabdh seats hari hain. Booked seats laal hain. Chuni gayi seats neeli hain.",
    "Window seats L se hain. Middle seats M se hain. Aisle seats R se hain.",
    "Seat ek L. Window seat, neeche ki deck.",
    "Seat ek M. Middle seat, upar ki deck.",
    "Seat ek R. Aisle seat, upar ki deck.",
    "Seat do L. Window seat, upar ki deck.",
    "Seat do M. Middle seat, upar ki deck.",
    "Seat do R. Aisle seat, upar ki deck.",
    "Seat teen L. Window seat, upar ki deck.",
    "Seat teen M. Middle seat, upar ki deck.",
    "Seat teen R. Aisle seat, upar ki deck.",
    "Seat chaar L. Window seat, upar ki deck.",
    "Seat chaar M. Middle seat, upar ki deck.",
    "Seat chaar R. Aisle seat, upar ki deck.",
    "Seat paanch L. Window seat, neeche ki deck.",
    "Seat paanch M. Middle seat, neeche ki deck.",
    "Seat paanch R. Aisle seat, neeche ki deck.",
    "Seat che L. Window seat, neeche ki deck.",
    "Seat che M. Middle seat, neeche ki deck.",
    "Seat che R. Aisle seat, neeche ki deck.",
    "Seat saat L. Window seat, neeche ki deck.",
    "Seat saat M. Middle seat, neeche ki deck.",
    "Seat saat R. Aisle seat, neeche ki deck.",
    "Seat aath L. Window seat, neeche ki deck.",
    "Seat aath M. Middle seat, neeche ki deck.",
    "Seat aath R. Aisle seat, neeche ki deck.",
    "Seat nau L. Window seat, neeche ki deck.",
    "Seat nau M. Middle seat, neeche ki deck.",
    "Seat nau R. Aisle seat, neeche ki deck.",
    "Seat das L. Window seat, neeche ki deck.",
    "Seat das M. Middle seat, neeche ki deck.",
    "Seat das R. Aisle seat, neeche ki deck.",
    "Seat chune ke liye seat number bolein. Jaise, paanch L, ya do M.",
    "Ek se chaar tak seats chun sakte hain.",
    "Confirm karne ke liye confirm bolein.",

    # 8. PASSENGER DETAILS
    "Yatri details screen. Apni jankari darj karein.",
    "Vikalp ek. Naam type karein.",
    "Vikalp do. Umar type karein.",
    "Vikalp teen. Ling chunein. Purush, mahila, ya anya.",
    "Vikalp chaar. Yatri add karein.",
    "Vikalp paanch. Mobile number darj karein.",
    "Vikalp che. Confirm karein.",
    "Ek aur yatri add karne ke liye yatri add bolein.",
    "Booking confirm karne ke liye confirm bolein.",
    "Das digit ka mobile number darj karein.",
    "Manager is number par call karke booking confirm karega.",
    "Payment cash ya UPI se call par kar sakte hain.",

    # 9. BOOKING CONFIRMATION
    "Booking submit ho gayi. Confirmation ka intezar karein.",
    "Manager jald hi call karega. Phone paas rakhein.",
    "Aapka PNR number hai. ZP bus nine eight seven six five four three.",
    "PNR number yaad rakhein ya likh lein.",
    "Booking confirm ho gayi. E-ticket phone par aayega.",
    "Boarding point par pandrah minute pehle pahunchein.",
    "Sath mein valid ID proof le jayein.",

    # 10. TICKET DETAILS
    "Ticket screen. Aapki booking details.",
    "PNR. ZP bus nine eight seven six five four three.",
    "Route. Mumbai se Pune. Bus VRL Travels.",
    "Bus type. AC Sleeper. Raat das baje. Subah do baje.",
    "Seat. Five L. Window seat, neeche ki deck.",
    "Yatri. Rahul. Umar pachchees. Purush.",
    "Mobile. Nine eight seven six five four three two one zero.",
    "Kul kiraya. Aath sau rupaye.",
    "Sabhi details sunne ke liye padhein bolein.",
    "Nayi booking ke liye aur bus book bolein.",

    # 11. MY BOOKINGS
    "Meri Bookings screen. Aapki saari bookings.",
    "Booking ek. Mumbai se Pune. VRL Travels. Kal. Confirm.",
    "Booking do. Delhi jaipur. Neeta Travels. Parson. Pending.",
    "Booking details sunne ke liye number bolein. Ek ya do.",
    "Nayi booking ke liye ghar bolein.",

    # 12. ALERTS
    "Chetavni. Is bus mein sirf char seats bachi hain.",
    "Sawdhan. Aapki bus teees minute mein niklegi.",
    "Smruti. Boarding point par pandrah minute jaldi pahunchein.",
    "Dhyan den. Boarding point badal gaya hai. Kurla Station.",
    "Suchna. Aapki bus bees minute deri se hai.",
    "Chetavni. Bus lagbhag bhar gayi hai. Sirf do seats.",
    "Sawdhan. Confirmation call aane wala hai.",
    "Smruti. Photo ID sath le jayein.",
    "Dhyan den. Payment pending hai. Manager call karega.",
    "Suchna. E-ticket mobile par bheja gaya.",
    "Chetavni. Mukt hone se ek ghanta kam hai.",
    "Sawdhan. Mausam se deri ho sakti hai.",
    "Smruti. Bus Dadar TT Circle se nikalti hai.",
    "Dhyan den. Booking confirm karein.",
    "Suchna. Booking operator se confirm ho gayi.",
    "Chetavni. Do ghante ke baad cancellation fee.",
    "Sawdhan. Traffic se thoda deri.",
    "Smruti. PNR number paas rakhein.",
    "Dhyan den. Dropping point Pune Station ke paas hai.",
    "Suchna. Yatra details update ho gayi.",

    # 13. ERRORS
    "Maaf kijiye, maine samajh nahi paya. Dobara bolein.",
    "Saaf suna nahi. Dobara bolein.",
    "Yeh command nahi hai. Madad bolein.",
    "Ek se paanch ke beech number bolein.",
    "Buses ke liye dono cities chahiye.",
    "Das digit ka mobile number darj karein.",
    "Us route ki koi bus nahi mili. Alag cities try karein.",
    "Kam se kam ek seat chunein.",
    "Error ho gaya. Dobara try karein.",
    "Kuch galat hua. Ghar bolein shuru se jaane ke liye.",
]

print(f"Generating {len(all_sentences)} Hindi sentences...")

for i, text in enumerate(all_sentences, 1):
    print(f"Generating {i}/{len(all_sentences)}: {text[:35]}...")
    gTTS(text=text, lang="hi").save(f"./bus_sahayak_hindi_full/line_{i:03d}.mp3")

print(f"\nDone! Generated {len(all_sentences)} Hindi voice files.")
print("Files saved in ./bus_sahayak_hindi_full/")
