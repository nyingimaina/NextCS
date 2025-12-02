import {
  Form,
  FormControlGroup,
  FormLabel,
  FormRow,
} from "@/app/Forms/Form/UI/Form";
import { ZestTextbox } from "@/musketeer/ZestTextbox/UI/ZestTextbox";
import { PureComponent } from "react";
import styles from "../Styles/Configuration.module.css";
import SelectPrimitive from "@/app/Forms/SelectWrapper/UI/SelectPrimitive";
import ActionPanel from "@/ActionPanel/UI/ActionPanel";
import ZestButton from "@/musketeer/ZestButton/UI/ZestButton";
import ConfigurationLogic from "../State/ConfigurationLogic";

const logic = new ConfigurationLogic();
export default class Configuration extends PureComponent {
  async componentDidMount() {
    logic.setRerender(this.forceUpdate.bind(this));
    await logic.initializeAsync();
  }
  render() {
    return (
      <Form>
        <div className={styles.sectionTitle}>Email</div>
        <FormRow>
          <FormControlGroup>
            <FormLabel>Status</FormLabel>
            <SelectPrimitive
              items={["Enabled", "Disabled"]}
              required={true}
              selectedResolver={(candidate) => {
                if (logic.model.emailConfiguration?.enabled) {
                  return candidate === "Enabled";
                } else {
                  return candidate === "Disabled";
                }
              }}
              onChange={(items: string[]) => {
                if (
                  !items ||
                  Array.isArray(items) === false ||
                  items.length === 0
                ) {
                  logic.updateModel({
                    emailConfiguration: {
                      ...logic.model.emailConfiguration,
                      enabled: false,
                    },
                  });
                } else {
                  const enabled = items[0] === "Enabled" ? true : false;
                  logic.updateModel({
                    emailConfiguration: {
                      ...logic.model.emailConfiguration,
                      enabled,
                    },
                  });
                }
              }}
            />
          </FormControlGroup>
          <FormControlGroup>
            <FormLabel>Sender Email Account</FormLabel>
            <ZestTextbox
              aria-label="Sender Email Account"
              disabled={logic.model.emailConfiguration?.enabled !== true}
              type="email"
              value={logic.model.emailConfiguration?.username ?? ""}
              onChange={(e) => {
                logic.updateModel({
                  emailConfiguration: {
                    ...logic.model.emailConfiguration,
                    username: e.target.value,
                  },
                });
              }}
              stretch={true}
            />
          </FormControlGroup>
          <FormControlGroup>
            <FormLabel>Password</FormLabel>
            <ZestTextbox
              aria-label="Password"
              disabled={logic.model.emailConfiguration?.enabled !== true}
              type="password"
              value={logic.model.emailConfiguration?.password ?? ""}
              onChange={(e) => {
                logic.updateModel({
                  emailConfiguration: {
                    ...logic.model.emailConfiguration,
                    password: e.target.value,
                  },
                });
              }}
              stretch={true}
            />
          </FormControlGroup>
        </FormRow>
        <FormRow className={styles.rowSpacer}>
          <FormControlGroup>
            <FormLabel>SMTP Host</FormLabel>
            <ZestTextbox
              aria-label="SMTP Host"
              disabled={logic.model.emailConfiguration?.enabled !== true}
              type="text"
              value={logic.model.emailConfiguration?.smtpHost ?? ""}
              onChange={(e) => {
                logic.updateModel({
                  emailConfiguration: {
                    ...logic.model.emailConfiguration,
                    smtpHost: e.target.value,
                  },
                });
              }}
              stretch={true}
            />
          </FormControlGroup>

          <FormControlGroup>
            <FormLabel>SMTP Port</FormLabel>
            <ZestTextbox
              aria-label="SMTP Port"
              disabled={logic.model.emailConfiguration?.enabled !== true}
              type="text"
              value={logic.model.emailConfiguration?.smtpPort?.toString() ?? ""}
              onChange={(e) => {
                logic.updateModel({
                  emailConfiguration: {
                    ...logic.model.emailConfiguration,
                    smtpPort: parseInt(e.target.value, 10),
                  },
                });
              }}
              stretch={true}
            />
          </FormControlGroup>
        </FormRow>
        <FormRow className={styles.rowSpacer}>
          <FormControlGroup>
            <FormLabel>
              Recipients (Comma separated for multiple recipients)
            </FormLabel>
            <ZestTextbox
              aria-label="Recipients"
              disabled={logic.model.emailConfiguration?.enabled !== true}
              type="text"
              value={logic.model.emailConfiguration?.to ?? ""}
              onChange={(e) => {
                logic.updateModel({
                  emailConfiguration: {
                    ...logic.model.emailConfiguration,
                    to: e.target.value,
                  },
                });
              }}
              stretch={true}
            />
          </FormControlGroup>
        </FormRow>
        <ActionPanel>
          <ZestButton
            type="submit"
            disabled={logic.canSave !== true}
            onClick={async () => {
              await logic.upsertAsync();
            }}
          >
            Save
          </ZestButton>
        </ActionPanel>
      </Form>
    );
  }
}
