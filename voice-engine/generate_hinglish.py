from gtts import gTTS
import os

os.makedirs("./bus_sahayak_hinglish", exist_ok=True)

all_sentences = [
    # 1. ONBOARDING
    "Namaste, Bus Sahayak mein aapka swagat hai. Yeh ek voice-first bus booking app hai.",
    "Is app mein aap sirf apni awaaz se bus ticket book kar sakte hain.",
    "Screen ko dabao aur awaaz se bolo. Double tap karke chuno. Triple tap karke ghar jao.",
    "Ek number bolkar option chuno. Jaise ek, do, teen.",
    "Chalo, aapki pehli booking shuru karte hain.",

    # 2. HOME SCREEN
    "Ghar ki screen. Aapke paas chaar options hain.",
    "Option ek. Bus Dhundho. Naye bus ke liye tickets khojo aur book karo.",
    "Option do. Meri Bookings. Apne tickets aur PNR status dekho.",
    "Option teen. Bus Track karo. Apni bus ki live location dekho.",
    "Option chaar. Madad. App ke baare mein jaankari aur sahayata.",
    "Kisi bhi option ko chunne ke liye uska number bolo. Jaise ek, do, teen, ya chaar.",
    "Screen ko dabakar sabhi options sun sakte ho.",
    "Ghar par wapas jaane ke liye ghar bolo ya triple tap karo.",

    # 3. SEARCH SCREEN - FROM CITY
    "Khoj screen. Pehle batao aap kahan se jaana chahte ho.",
    "Option ek. Mumbai se.",
    "Option do. Delhi se.",
    "Option teen. Pune se.",
    "Option chaar. Bangalore se.",
    "Option paanch. Jaipur se.",
    "Option che. Hyderabad se.",
    "Option saat. Chennai se.",
    "Option aath. Kolkata se.",
    "Option nau. Ahmedabad se.",
    "Option das. Koi aur shehar. Apna shehar ka naam bolo.",
    "Shehar ka number bolo ya seedha naam bolo.",

    # 4. SEARCH SCREEN - TO CITY
    "Ab batao aap kahan jaana chahte ho.",
    "Option ek. Mumbai tak.",
    "Option do. Delhi tak.",
    "Option teen. Pune tak.",
    "Option chaar. Bangalore tak.",
    "Option paanch. Jaipur tak.",
    "Option che. Hyderabad tak.",
    "Option saat. Chennai tak.",
    "Option aath. Kolkata tak.",
    "Option nau. Ahmedabad tak.",
    "Option das. Koi aur shehar. Apna shehar ka naam bolo.",
    "Dono cities set ho gayi. Ab buses dhundne ke liye khoj bolo.",

    # 5. RESULTS SCREEN - BUS OPTIONS
    "Mumbai se Pune ke liye paanch buses mili.",
    "Bus ek. VRL Travels. AC Sleeper. Raat 10 baje nikalti hai. Kiraya 800 rupaye.",
    "Bus do. Neeta Travels. Volvo AC. Raat 11:30 baje nikalti hai. Kiraya 650 rupaye.",
    "Bus teen. MSRTC Shivneri. AC Seater. Subah 6 baje nikalti hai. Kiraya 450 rupaye.",
    "Bus chaar. Paulo Travels. Non-AC Sleeper. Raat 9 baje nikalti hai. Kiraya 500 rupaye.",
    "Bus paanch. RedBus Express. AC Seater. Subah 8 baje nikalti hai. Kiraya 550 rupaye.",
    "Bus chunne ke liye uska number bolo. Ek, do, teen, chaar, ya paanch.",
    "Sabhi buses ko dobara sunne ke liye padho bolo.",
    "Sasta bus dhundne ke liye sasta bolo.",
    "Tez bus dhundne ke liye tez bolo.",
    "Wapas jaane ke liye wapas bolo.",

    # 6. BUS DETAILS
    "VRL Travels ki jaankari. AC Sleeper bus. 10 seats bachi hain. Rating 4.5.",
    "Boarding point. Mumbai Dadar TT Circle.",
    "Dropping point. Pune Station Road.",
    "Yatra ka samay. 4 ghante.",
    "WiFi, kambal, paani ki botal milti hai.",
    "Cancellation. 4 ghante pehle tak muft hai.",
    "Neeta Travels ki jaankari. Volvo AC bus. 24 seats bachi hain. Rating 4.3.",
    "Boarding point. Mumbai Kurla Station.",
    "Dropping point. Pune Swargate.",
    "Yatra ka samay. 4.5 ghante.",
    "Paani ki botal, kambal, charging point milta hai.",
    "Cancellation. 2 ghante pehle tak muft hai.",
    "MSRTC Shivneri ki jaankari. AC Seater bus. 8 seats bachi hain. Rating 4.2.",
    "Boarding point. Mumbai Mumbai Central.",
    "Dropping point. Pune Kothrud Depot.",
    "Yatra ka samay. 4.5 ghante.",
    "Paani ki botal, charging point milta hai.",
    "Cancellation. 1 ghanta pehle tak muft hai.",

    # 7. SEAT SELECTION
    "Seat selection screen. Apni seat chuno.",
    "Upar ki deck. Rows 1 se 4.",
    "Neeche ki deck. Rows 5 se 10.",
    "Available seats hari hain. Booked seats laal hain. Chuni gayi seats neeli hain.",
    "Window seats L se hain. Middle seats M se hain. Aisle seats R se hain.",
    "Seat 1L. Window seat, neeche ki deck.",
    "Seat 1M. Middle seat, upar ki deck.",
    "Seat 1R. Aisle seat, upar ki deck.",
    "Seat 2L. Window seat, upar ki deck.",
    "Seat 2M. Middle seat, upar ki deck.",
    "Seat 2R. Aisle seat, upar ki deck.",
    "Seat 3L. Window seat, upar ki deck.",
    "Seat 3M. Middle seat, upar ki deck.",
    "Seat 3R. Aisle seat, upar ki deck.",
    "Seat 4L. Window seat, upar ki deck.",
    "Seat 4M. Middle seat, upar ki deck.",
    "Seat 4R. Aisle seat, upar ki deck.",
    "Seat 5L. Window seat, neeche ki deck.",
    "Seat 5M. Middle seat, neeche ki deck.",
    "Seat 5R. Aisle seat, neeche ki deck.",
    "Seat 6L. Window seat, neeche ki deck.",
    "Seat 6M. Middle seat, neeche ki deck.",
    "Seat 6R. Aisle seat, neeche ki deck.",
    "Seat 7L. Window seat, neeche ki deck.",
    "Seat 7M. Middle seat, neeche ki deck.",
    "Seat 7R. Aisle seat, neeche ki deck.",
    "Seat 8L. Window seat, neeche ki deck.",
    "Seat 8M. Middle seat, neeche ki deck.",
    "Seat 8R. Aisle seat, neeche ki deck.",
    "Seat 9L. Window seat, neeche ki deck.",
    "Seat 9M. Middle seat, neeche ki deck.",
    "Seat 9R. Aisle seat, neeche ki deck.",
    "Seat 10L. Window seat, neeche ki deck.",
    "Seat 10M. Middle seat, neeche ki deck.",
    "Seat 10R. Aisle seat, neeche ki deck.",
    "Seat chunne ke liye seat number bolo. Jaise 5L ya 2M.",
    "1 se 4 tak seats chun sakte ho.",
    "Confirm karne ke liye confirm bolo.",

    # 8. PASSENGER DETAILS
    "Passenger details screen. Apni jaankari daalo.",
    "Option ek. Naam type karo.",
    "Option do. Umar type karo.",
    "Option teen. Gender chuno. Male, Female, ya Other.",
    "Option chaar. Passenger add karo.",
    "Option paanch. Mobile number daalo.",
    "Option che. Confirm karo.",
    "Ek aur passenger add karne ke liye passenger add bolo.",
    "Booking confirm karne ke liye confirm bolo.",
    "10 digit ka mobile number daalo.",
    "Manager is number par call karke booking confirm karega.",
    "Payment cash ya UPI se call par kar sakte ho.",

    # 9. BOOKING CONFIRMATION
    "Booking submit ho gayi. Confirmation ka wait karo.",
    "Manager jald hi call karega. Phone paas rakho.",
    "Aapka PNR number hai. ZP bus 9876543.",
    "PNR number yaad rakho ya likh lo.",
    "Booking confirm ho gayi. E-ticket phone par aayegi.",
    "Boarding point par 15 minute pehle pahuncho.",
    "Saath mein valid ID proof le jao.",

    # 10. TICKET DETAILS
    "Ticket screen. Aapki booking details.",
    "PNR. ZP bus 9876543.",
    "Route. Mumbai se Pune. Bus VRL Travels.",
    "Bus type. AC Sleeper. Raat 10 baje. Subah 2 baje.",
    "Seat. 5L. Window seat, neeche ki deck.",
    "Passenger. Rahul. Umar 25. Male.",
    "Mobile. 9876543210.",
    "Total kiraya. 800 rupaye.",
    "Sabhi details sunne ke liye padho bolo.",
    "Nayi booking ke liye aur bus book bolo.",

    # 11. MY BOOKINGS
    "Meri Bookings screen. Aapki saari bookings.",
    "Booking ek. Mumbai se Pune. VRL Travels. Kal. Confirm.",
    "Booking do. Delhi se Jaipur. Neeta Travels. Parson. Pending.",
    "Booking details sunne ke liye number bolo. Ek ya do.",
    "Nayi booking ke liye ghar bolo.",

    # 12. ALERTS
    "Alert. Is bus mein sirf 4 seats bachi hain.",
    "Sawdhan. Aapki bus 30 minute mein niklegi.",
    "Yaad rakho. Boarding point par 15 minute jaldi pahuncho.",
    "Dhyan do. Boarding point badal gaya hai. Kurla Station.",
    "Update. Aapki bus 20 minute deri se hai.",
    "Alert. Bus lagbhag bhar gayi hai. Sirf 2 seats.",
    "Sawdhan. Confirmation call aane wala hai.",
    "Yaad rakho. Photo ID saath le jao.",
    "Dhyan do. Payment pending hai. Manager call karega.",
    "Update. E-ticket mobile par bheja gaya.",
    "Alert. Mukt hone se 1 ghanta kam hai.",
    "Sawdhan. Mausam se deri ho sakti hai.",
    "Yaad rakho. Bus Dadar TT Circle se nikalti hai.",
    "Dhyan do. Booking confirm karo.",
    "Update. Booking operator se confirm ho gayi.",
    "Alert. 2 ghante ke baad cancellation fee lagegi.",
    "Sawdhan. Traffic se thoda deri ho sakti hai.",
    "Yaad rakho. PNR number paas rakho.",
    "Dhyan do. Dropping point Pune Station ke paas hai.",
    "Update. Yatra details update ho gayi.",

    # 13. ERRORS
    "Maaf karo, maine samajh nahi paya. Dobara bolo.",
    "Saaf suna nahi. Dobara bolo.",
    "Yeh command nahi hai. Madad bolo.",
    "1 se 5 ke beech number bolo.",
    "Buses ke liye dono cities chahiye.",
    "10 digit ka mobile number daalo.",
    "Us route ki koi bus nahi mili. Alag cities try karo.",
    "Kam se kam ek seat chuno.",
    "Error ho gaya. Dobara try karo.",
    "Kuch galat hua. Ghar bolo shuru se jaane ke liye.",
]

print(f"Generating {len(all_sentences)} Hinglish sentences...")

for i, text in enumerate(all_sentences, 1):
    print(f"Generating {i}/{len(all_sentences)}: {text[:40]}...")
    gTTS(text=text, lang="hi").save(f"./bus_sahayak_hinglish/line_{i:03d}.mp3")

print(f"\nDone! Generated {len(all_sentences)} Hinglish voice files.")
print("Files saved in ./bus_sahayak_hinglish/")
