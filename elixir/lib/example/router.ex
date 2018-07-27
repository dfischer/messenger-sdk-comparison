defmodule Example.Router do
  use Plug.Router
  require Logger

  plug(:match)
  plug(Plug.Parsers, parsers: [:json], pass: ["application/json"], json_decoder: Jason)
  plug(:dispatch)

  if Mix.env() == :dev do
    use Plug.Debugger
  end

  use Plug.ErrorHandler

  defp post_messaging_request(body) do
    HTTPoison.post(
      "https://graph.facebook.com/v2.6/me/messages?access_token=#{
        System.get_env("MESSENGER_ACCESS_TOKEN")
      }",
      body,
      [
        {"Content-Type", "application/json"}
      ]
    )
  end

  defp send_message_text(sender_psid, response) do
    body =
      Jason.encode!(%{
        "recipient" => %{"id" => sender_psid},
        "message" => %{"text" => "Elixir Echo: #{response}"}
      })

    case post_messaging_request(body) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        IO.puts(body)

      {:error, %HTTPoison.Error{reason: reason}} ->
        IO.inspect(reason)
    end
  end

  defp process_event(event) do
    sender_psid = event |> Map.get("sender") |> Map.get("id")
    message = event |> Map.get("message") |> Map.get("text")
    send_message_text(sender_psid, message)
  end

  post "/webhook" do
    {:ok, entries} = Map.fetch(conn.body_params, "entry")

    Enum.each(entries, fn entry ->
      {:ok, messaging} = Map.fetch(entry, "messaging")
      # Messaging is only ever once, just grab first...
      process_event(List.first(messaging))
    end)

    send_resp(conn, 200, "Success!")
  end

  get "/webhook" do
    case conn.query_params["hub.verify_token"] do
      "dfischer" -> send_resp(conn, 200, conn.query_params["hub.challenge"])
      _ -> send_resp(conn, 403, "Forbidden")
    end
  end

  get("/", do: send_resp(conn, 200, "Welcome"))
  match(_, do: send_resp(conn, 404, "Opps!"))
end
