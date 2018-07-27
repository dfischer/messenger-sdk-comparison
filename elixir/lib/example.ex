defmodule Example do
  use Application
  require Logger

  def start(_type, _args) do
    children = [
      Plug.Adapters.Cowboy.child_spec(:http, Example.Router, [], port: 8080)
    ]

    Logger.info("Started application")

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
