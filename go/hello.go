package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type id struct {
	ID string
}

type message struct {
	Mid  string
	Seq  int
	Text string
}

type messaging struct {
	Sender    id
	Recipient id
	Timestamp int
	Message   message
}

type entry struct {
	ID        string
	Time      int
	Messaging []messaging
}

type payload struct {
	Object string
	Entry  []entry
}

type messageText struct {
	Text string `json:"text"`
}

type messageRecipientID struct {
	RecipientID string `json:"id"`
}

type sendMessageText struct {
	Recipient messageRecipientID `json:"recipient"`
	Message   messageText        `json:"message"`
}

func sendText(s id, t string) {
	cb := sendMessageText{
		Recipient: messageRecipientID{
			RecipientID: s.ID,
		},
		Message: messageText{
			Text: t,
		},
	}

	data, err := json.Marshal(cb)
	if err != nil {
		fmt.Println("Oh no! There was an error:", err)
		return
	}

	postURL := fmt.Sprintf("https://graph.facebook.com/v2.6/me/messages?access_token=%s", os.Getenv("MESSENGER_ACCESS_TOKEN"))

	resp, err := http.Post(postURL, "application/json", bytes.NewBuffer(data))

	if err != nil {
		log.Println("Error!:", err)
	}

	defer resp.Body.Close()

	log.Println(resp)
}

func handlePayload(w http.ResponseWriter, r *http.Request) {
	p := &payload{}

	if err := json.NewDecoder(r.Body).Decode(p); err != nil {
		log.Printf("Error decoding body: %s", err)
		return
	}

	for _, v := range p.Entry {
		// Messaging is only ever one so just grab first
		messaging := v.Messaging[0]
		sendText(messaging.Sender, messaging.Message.Text)
	}

	w.Write([]byte("Webhook Received"))

}

func handleValidation(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	if q.Get("hub.verify_token") == "dfischer" {
		w.Write([]byte(q.Get("hub.challenge")))
	} else {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		handleValidation(w, r)
	case "POST":
		handlePayload(w, r)
	}
}

func main() {
	http.HandleFunc("/webhook", handleWebhook)

	if err := http.ListenAndServe(":9090", nil); err != nil {
		panic(err)
	}
}
