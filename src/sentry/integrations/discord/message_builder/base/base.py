from __future__ import annotations

from sentry.integrations.message_builder import AbstractMessageBuilder

from .component import DiscordMessageComponent
from .embed import DiscordMessageEmbed
from .flags import DiscordMessageFlags


class DiscordMessageBuilder(AbstractMessageBuilder):
    """
    Base DiscordMessageBuilder class.

    Should be extended to provide more abstracted message builders for
    specific types of messages (e.g. DiscordIssuesMessageBuilder).
    """

    def __init__(
        self,
        content: str | None = None,
        embeds: list[DiscordMessageEmbed] | None = None,
        components: list[DiscordMessageComponent] | None = None,
        flags: DiscordMessageFlags | None = None,
    ) -> None:
        self.content = content
        self.embeds = embeds
        self.components = components
        self.flags = flags

    def build(self) -> dict[str, object]:
        return self._build(
            self.content,
            self.embeds,
            self.components,
            self.flags,
        )

    def _build(
        self,
        content: str | None = None,
        embeds: list[DiscordMessageEmbed] | None = None,
        components: list[DiscordMessageComponent] | None = None,
        flags: DiscordMessageFlags | None = None,
    ) -> dict[str, object]:
        """
        Helper method for building arbitrary Discord messages.
        """
        message: dict[str, object] = {}

        if content is not None:
            message["content"] = content

        if embeds is not None:
            message["embeds"] = [embed.build() for embed in embeds]

        if components is not None:
            message["components"] = [component.build() for component in components]

        if flags is not None:
            message["flags"] = flags.value

        return message