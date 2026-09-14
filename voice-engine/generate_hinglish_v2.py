from gtts import gTTS
import os

os.makedirs("./bus_sahayak_hinglish", exist_ok=True)

all_sentences = [
    # 1. ONBOARDING
    "Namaste, Bus Sahayak mein welcome hai. Yeh voice-first bus booking app hai.",
    "Is app mein aap sirf awaaz se bus ticket book kar sakte ho.",
    "Screen hold karo aur awaaz se bolo. Double tap karke select karo. Triple tap karke home screen par jao.",
    "Ek number bolkar option select karo. Jaise ek, do, teen.",
    "Chalo, aapki pehli booking start karte hain.",

    # 2. HOME SCREEN
    "Home screen. Aapke paas chaar options hain.",
    "Option ek. Bus Dhundho. Nayi bus ke liye tickets search karo aur book karo.",
    "Option do. Meri Bookings. Apne tickets aur PNR status check karo.",
    "Option teen. Bus Track karo. Apni bus ki live location dekho.",
    "Option chaar. Madad. App ke baare mein info aur help.",
    "Kisi bhi option ko select karne ke liye uska number bolo. Jaise ek, do, teen, ya chaar.",
    "Screen hold karke sabhi options sun sakte ho.",
    "Home screen par wapas jaane ke liye home bolo ya triple tap karo.",

    # 3. SEARCH SCREEN - FROM CITY
    "Search screen. Pehle batao aap kahan se jaana chahte ho.",
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
    "Dono cities set ho gayi. Ab buses search karne ke liye search bolo.",

    # 5. RESULTS SCREEN - BUS OPTIONS
    "Mumbai se Pune ke liye paanch buses mili.",
    "Bus ek. VRL Travels. AC Sleeper. Raat 10 baje nikalti hai. Fare 800 rupaye.",
    "Bus do. Neeta Travels. Volvo AC. Raat 11:30 baje nikalti hai. Fare 650 rupaye.",
    "Bus teen. MSRTC Shivneri. AC Seater. Subah 6 baje nikalti hai. Fare 450 rupaye.",
    "Bus chaar. Paulo Travels. Non-AC Sleeper. Raat 9 baje nikalti hai. Fare 500 rupaye.",
    "Bus paanch. RedBus Express. AC Seater. Subah 8 baje nikalti hai. Fare 550 rupaye.",
    "Bus select karne ke liye uska number bolo. Ek, do, teen, chaar, ya paanch.",
    "Sabhi buses ko dobara sunne ke liye read bolo.",
    "Cheap bus dhundne ke liye cheap bolo.",
    "Fast bus dhundne ke liye fast bolo.",
    "Back jaane ke liye back bolo.",

    # 6. BUS DETAILS
    "VRL Travels ki info. AC Sleeper bus. 10 seats available hain. Rating 4.5.",
    "Boarding point. Mumbai Dadar TT Circle.",
    "Dropping point. Pune Station Road.",
    "Travel time. 4 ghante.",
    "WiFi, blanket, paani ki botal milti hai.",
    "Cancellation. 4 ghante pehle tak free hai.",
    "Neeta Travels ki info. Volvo AC bus. 24 seats available hain. Rating 4.3.",
    "Boarding point. Mumbai Kurla Station.",
    "Dropping point. Pune Swargate.",
    "Travel time. 4.5 ghante.",
    "Paani ki botal, blanket, charging point milta hai.",
    "Cancellation. 2 ghante pehle tak free hai.",
    "MSRTC Shivneri ki info. AC Seater bus. 8 seats available hain. Rating 4.2.",
    "Boarding point. Mumbai Mumbai Central.",
    "Dropping point. Pune Kothrud Depot.",
    "Travel time. 4.5 ghante.",
    "Paani ki botal, charging point milta hai.",
    "Cancellation. 1 ghanta pehle tak free hai.",

    # 7. SEAT SELECTION
    "Seat selection screen. Apni seat select karo.",
    "Upper deck. Rows 1 se 4.",
    "Lower deck. Rows 5 se 10.",
    "Available seats green mein hain. Booked seats red mein hain. Selected seats blue mein hain.",
    "Window seats L se hain. Middle seats M se hain. Aisle seats R se hain.",
    "Seat 1L. Window seat, lower deck.",
    "Seat 1M. Middle seat, upper deck.",
    "Seat 1R. Aisle seat, upper deck.",
    "Seat 2L. Window seat, upper deck.",
    "Seat 2M. Middle seat, upper deck.",
    "Seat 2R. Aisle seat, upper deck.",
    "Seat 3L. Window seat, upper deck.",
    "Seat 3M. Middle seat, upper deck.",
    "Seat 3R. Aisle seat, upper deck.",
    "Seat 4L. Window seat, upper deck.",
    "Seat 4M. Middle seat, upper deck.",
    "Seat 4R. Aisle seat, upper deck.",
    "Seat 5L. Window seat, lower deck.",
    "Seat 5M. Middle seat, lower deck.",
    "Seat 5R. Aisle seat, lower deck.",
    "Seat 6L. Window seat, lower deck.",
    "Seat 6M. Middle seat, lower deck.",
    "Seat 6R. Aisle seat, lower deck.",
    "Seat 7L. Window seat, lower deck.",
    "Seat 7M. Middle seat, lower deck.",
    "Seat 7R. Aisle seat, lower deck.",
    "Seat 8L. Window seat, lower deck.",
    "Seat 8M. Middle seat, lower deck.",
    "Seat 8R. Aisle seat, lower deck.",
    "Seat 9L. Window seat, lower deck.",
    "Seat 9M. Middle seat, lower deck.",
    "Seat 9R. Aisle seat, lower deck.",
    "Seat 10L. Window seat, lower deck.",
    "Seat 10M. Middle seat, lower deck.",
    "Seat 10R. Aisle seat, lower deck.",
    "Seat select karne ke liye seat number bolo. Jaise 5L ya 2M.",
    "1 se 4 tak seats select kar sakte ho.",
    "Confirm karne ke liye confirm bolo.",

    # 8. PASSENGER DETAILS
    "Passenger details screen. Apni info daalo.",
    "Option ek. Naam type karo.",
    "Option do. Umar type karo.",
    "Option teen. Gender select karo. Male, Female, ya Other.",
    "Option chaar. Passenger add karo.",
    "Option paanch. Mobile number daalo.",
    "Option che. Confirm karo.",
    "Ek aur passenger add karne ke liye add passenger bolo.",
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
    "Seat. 5L. Window seat, lower deck.",
    "Passenger. Rahul. Umar 25. Male.",
    "Mobile. 9876543210.",
    "Total fare. 800 rupaye.",
    "Sabhi details sunne ke liye read ticket bolo.",
    "Nayi booking ke liye book another bolo.",

    # 11. MY BOOKINGS
    "Meri Bookings screen. Aapki saari bookings.",
    "Booking ek. Mumbai se Pune. VRL Travels. Kal. Confirm.",
    "Booking do. Delhi se Jaipur. Neeta Travels. Parson. Pending.",
    "Booking details sunne ke liye number bolo. Ek ya do.",
    "Nayi booking ke liye home bolo.",

    # 12. ALERTS
    "Alert. Is bus mein sirf 4 seats bachi hain.",
    "Sawdhan. Aapki bus 30 minute mein niklegi.",
    "Yaad rakho. Boarding point par 15 minute jaldi pahuncho.",
    "Dhyan do. Boarding point change ho gaya hai. Kurla Station.",
    "Update. Aapki bus 20 minute late hai.",
    "Alert. Bus lagbhag full ho gayi hai. Sirf 2 seats.",
    "Sawdhan. Confirmation call aane wala hai.",
    "Yaad rakho. Photo ID saath le jao.",
    "Dhyan do. Payment pending hai. Manager call karega.",
    "Update. E-ticket mobile par send ho gaya.",
    "Alert. Cancel karne ke liye sirf 1 ghanta baaki hai.",
    "Sawdhan. Mausam ki wajah se late ho sakti hai.",
    "Yaad rakho. Bus Dadar TT Circle se nikalti hai.",
    "Dhyan do. Booking confirm karo.",
    "Update. Booking operator ne confirm kar diya.",
    "Alert. 2 ghante ke baad cancellation charge lagega.",
    "Sawdhan. Traffic ki wajah se thoda late ho sakta hai.",
    "Yaad rakho. PNR number paas rakho.",
    "Dhyan do. Dropping point Pune Station ke paas hai.",
    "Update. Yatra details update ho gayi.",

    # 13. ERRORS
    "Maaf karo, maine samajh nahi paya. Dobara bolo.",
    "Saaf suna nahi. Dobara bolo.",
    "Yeh command nahi hai. Help bolo.",
    "1 se 5 ke beech number bolo.",
    "Buses ke liye dono cities chahiye.",
    "10 digit ka mobile number daalo.",
    "Us route ki koi bus nahi mili. Alag cities try karo.",
    "Kam se kam ek seat select karo.",
    "Error ho gaya. Dobara try karo.",
    "Kuch galat hua. Home screen par jao aur shuru se karo.",
]

print(f"Generating {len(all_sentences)} Hinglish sentences...")

for i, text in enumerate(all_sentences, 1):
    print(f"Generating {i}/{len(all_sentences)}: {text[:40]}...")
    gTTS(text=text, lang="hi").save(f"./bus_sahayak_hinglish/line_{i:03d}.mp3")

print(f"\nDone! Generated {len(all_sentences)} Hinglish voice files.")
print("Files saved in ./bus_sahayak_hinglish/")
