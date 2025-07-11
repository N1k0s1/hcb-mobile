import { useTheme } from "@react-navigation/native";
import Icon from "@thedev132/hackclub-icons-rn";
import { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  ViewProps,
  type AppStateStatus,
  AppState,
  useWindowDimensions,
  Image,
} from "react-native";
import { SvgXml } from "react-native-svg";

import Card from "../lib/types/Card";
import GrantCard from "../lib/types/GrantCard";
import { CardDetails } from "../lib/useStripeCardDetails";
import { palette } from "../theme";
import { redactedCardNumber, renderCardNumber } from "../util";

import CardChip from "./cards/CardChip";

export default function PaymentCard({
  card,
  details,
  onCardLoad,
  pattern,
  patternDimensions,
  ...props
}: ViewProps & {
  card: Card;
  details?: CardDetails;
  onCardLoad?: (
    cardId: string,
    dimensions: { width: number; height: number },
  ) => void;
  pattern?: string;
  patternDimensions?: { width: number; height: number };
}) {
  const { colors: themeColors, dark } = useTheme();
  const appState = useRef(AppState.currentState);
  const [isAppInBackground, setisAppInBackground] = useState(appState.current);
  const { width } = useWindowDimensions();

  const isCardDataValid = card && card.id;

  useEffect(() => {
    if (onCardLoad && isCardDataValid && patternDimensions) {
      onCardLoad(card.id, patternDimensions);
    }
  }, [card?.id, onCardLoad, patternDimensions, isCardDataValid]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        appState.current = nextAppState;
        setisAppInBackground(appState.current);
      },
    );

    return () => subscription.remove();
  }, []);

  if ((card as GrantCard)?.amount_cents) {
    card.type = "virtual";
  }

  if (!isCardDataValid) {
    return (
      <View
        style={{
          backgroundColor: dark ? "#222" : "#eee",
          padding: 30,
          width: width * 0.86,
          height: (width * 0.86) / 1.588,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
          ...(props.style as object),
        }}
      >
        <Text style={{ color: dark ? "#999" : "#666" }}>Loading card...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: card.type == "physical" ? "black" : themeColors.card,
        padding: 30,
        width: width * 0.86,
        height: (width * 0.86) / 1.588,
        borderRadius: 15,
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "stretch",
        position: "relative",
        borderWidth: 0,
        borderColor: dark ? palette.slate : palette.muted,
        ...(props.style as object),
        overflow: "hidden",
      }}
    >
      {card.type == "virtual" && pattern && (
        <View
          style={{
            position: "absolute",
            flexDirection: "row",
            flexWrap: "wrap",
            width: width * 0.86,
            height: (width * 0.86) / 1.5,
          }}
        >
          <SvgXml xml={pattern} width="100%" height="100%" />
        </View>
      )}

      {card.type == "physical" && (
        <View style={{ top: 5, right: 5, position: "absolute" }}>
          <Icon glyph="bank-account" size={64} color="white" />
        </View>
      )}
      {card.status == "frozen" && (
        <>
          <Image
            source={require("../../assets/card-frost.png")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: width * 0.86,
              height: (width * 0.86) / 1.588,
              resizeMode: "cover",
              opacity: 0.32,
              borderRadius: 15,
            }}
          />
          <View style={{ top: 25, left: 25, position: "absolute" }}>
            <Icon glyph="freeze" size={32} color="white" opacity={0.5} />
          </View>
        </>
      )}

      {card.type == "physical" && <CardChip />}
      <Text
        style={{
          color: "white",
          fontSize: 18,
          marginBottom: 4,
          fontFamily: "Consolas-Bold",
        }}
      >
        {details && isAppInBackground === "active"
          ? renderCardNumber(details.number)
          : redactedCardNumber(card.last4)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View>
          <Text
            style={{
              color: "white",
              fontFamily: "Consolas-Bold",
              fontSize: 18,
              width: 180,
              textTransform: "uppercase",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {card.user?.name || card.organization?.name || "Card Holder"}
          </Text>
        </View>
        <View style={{ position: "absolute", right: 0 }}>
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontFamily: "Consolas-Bold",
              fontWeight: 700,
              textTransform: "uppercase",
              backgroundColor:
                card.type == "virtual"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.08)",
              borderRadius: 15,
              paddingHorizontal: 10,
              paddingVertical: 3,
              overflow: "hidden",
            }}
          >
            {card.status === "expired" ? "canceled" : card.status}
          </Text>
        </View>
      </View>
    </View>
  );
}
