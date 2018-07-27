defmodule MessengerTest do
  use ExUnit.Case
  doctest Messenger

  test "greets the world" do
    assert Messenger.hello() == :world
  end
end
