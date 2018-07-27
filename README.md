# Messenger SDK Implementation Comparison By Language

This is a very simple example of a trivial application that listens to a webhook from the Messenger SDK platform and then sends an echo back to the sender.

The purpose of this was to get a feel of idioms from other languages. I the author personally am most familiar with Javascript flavors (Node & Typescript).

I welcome any feedback to increase any language(s) readability and adhere to the idioms of that community.

# Interesting notes

## Memory Usage

On Macbook Pro (Recent)

1.  Go memory: 10.7 MB
2.  Typescript: 90 MB
3.  Node: 63 MB
4.  Elixir/Beam: 142 MB

I'm surprised at the difference between Typescript & Node (maybe because I'm running with ts-node).
