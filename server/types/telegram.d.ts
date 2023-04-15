interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
}

interface Chat {}
interface MessageEntity {}
interface Animation {}
interface Audio {}
interface Document {}
interface PhotoSize {}
interface Sticker {}
interface Video {}
interface VideoNote {}
interface Voice {}
interface Contact {}
interface Dice {}
interface Game {}
interface Poll {}
interface Venue {}
interface Location {}
interface MessageAutoDeleteTimerChanged {}
interface Invoice {}
interface SuccessfulPayment {}
interface WriteAccessAllowed {}
interface PassportData {}
interface ProximityAlertTriggered {}
interface ForumTopicCreated {}
interface ForumTopicEdited {}
interface ForumTopicClosed {}
interface ForumTopicReopened {}
interface GeneralForumTopicHidden {}
interface GeneralForumTopicUnhidden {}
interface VideoChatScheduled {}
interface VideoChatStarted {}
interface VideoChatEnded {}
interface VideoChatParticipantsInvited {}
interface WebAppData {}
interface InlineKeyboardMarkup {}
interface InlineQuery {}
interface ChosenInlineResult {}
interface CallbackQuery {}
interface ShippingQuery {}
interface PreCheckoutQuery {}
interface PollAnswer {}
interface ChatMemberUpdated {}
interface ChatMemberUpdated {}
interface ChatJoinRequest {}

interface Message {
  message_id: number;
  message_thread_id?: number;
  from?: User;
  sender_chat?: Chat;
  date: number;
  chat: Chat;
  forward_from?: User;
  forward_from_chat?: Chat;
  forward_from_message_id?: number;
  forward_signature?: string;
  forward_sender_name?: string;
  forward_date?: number;
  is_topic_message?: boolean;
  is_automatic_forward?: boolean;
  reply_to_message?: Message;
  via_bot?: User;
  edit_date?: number;
  has_protected_content?: boolean;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  entities?: MessageEntity[];
  animation?: Animation;
  audio?: Audio;
  document?: Document;
  photo?: PhotoSize[];
  sticker?: Sticker;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  caption?: string;
  caption_entities?: MessageEntity[];
  has_media_spoiler?: boolean;
  contact?: Contact;
  dice?: Dice;
  game?: Game;
  poll?: Poll;
  venue?: Venue;
  location?: Location;
  new_chat_members?: User[];
  left_chat_member?: User;
  new_chat_title?: string;
  new_chat_photo?: PhotoSize[];
  delete_chat_photo?: boolean;
  group_chat_created?: boolean;
  supergroup_chat_created?: boolean;
  channel_chat_created?: boolean;
  message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged;
  migrate_to_chat_id?: number;
  migrate_from_chat_id?: number;
  pinned_message?: Message;
  invoice?: Invoice;
  successful_payment?: SuccessfulPayment;
  connected_website?: string;
  write_access_allowed?: WriteAccessAllowed;
  passport_data?: PassportData;
  proximity_alert_triggered?: ProximityAlertTriggered;
  forum_topic_created?: ForumTopicCreated;
  forum_topic_edited?: ForumTopicEdited;
  forum_topic_closed?: ForumTopicClosed;
  forum_topic_reopened?: ForumTopicReopened;
  general_forum_topic_hidden?: GeneralForumTopicHidden;
  general_forum_topic_unhidden?: GeneralForumTopicUnhidden;
  video_chat_scheduled?: VideoChatScheduled;
  video_chat_started?: VideoChatStarted;
  video_chat_ended?: VideoChatEnded;
  video_chat_participants_invited?: VideoChatParticipantsInvited;
  web_app_data?: WebAppData;
  reply_markup?: InlineKeyboardMarkup;
}

interface Update {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  channel_post?: Message;
  edited_channel_post?: Message;
  inline_query?: InlineQuery;
  chosen_inline_result?: ChosenInlineResult;
  callback_query?: CallbackQuery;
  shipping_query?: ShippingQuery;
  pre_checkout_query?: PreCheckoutQuery;
  poll?: Poll;
  poll_answer?: PollAnswer;
  my_chat_member?: ChatMemberUpdated;
  chat_member?: ChatMemberUpdated;
  chat_join_request?: ChatJoinRequest;
}

interface TelegramResponse<T = any> {
  ok: boolean;
  result: T;
}

interface SendMessageParams {
  message: string;
  userID: number;
  markdown?: boolean;
}

interface TelegramBot {
  startPolling: (interval?: number) => void;
  stopPolling: () => void;
  getMe: () => Promise<User>;
  sendMessage: (params: SendMessageParams) => Promise<Message>;
  getUpdates: () => Promise<Update[]>;
  updateSubscribers: (rentals: Rental[]) => Promise<void>;
  checkForRentalUpdates: () => Promise<void>;
}
