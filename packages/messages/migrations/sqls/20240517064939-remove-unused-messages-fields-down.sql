ALTER TABLE messages
    ADD message_type text not null,
    ADD links text[],
    ADD payment_request_id uuid;