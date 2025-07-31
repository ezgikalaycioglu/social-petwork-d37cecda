import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AbuseReportRequest {
  reportedContentType: 'tweet' | 'pet_profile' | 'user';
  reportedContentId?: string;
  reportedUserName?: string;
  reportedPetName?: string;
  abuseType: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const reportData: AbuseReportRequest = await req.json();

    if (!reportData.abuseType) {
      return new Response(
        JSON.stringify({ error: "Abuse type is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Insert abuse report into database
    const { data: report, error: insertError } = await supabase
      .from('abuse_reports')
      .insert({
        reporter_id: user.id,
        reported_content_type: reportData.reportedContentType,
        reported_content_id: reportData.reportedContentId,
        reported_user_name: reportData.reportedUserName,
        reported_pet_name: reportData.reportedPetName,
        abuse_type: reportData.abuseType,
        description: reportData.description,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting abuse report:', insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit report" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email notification using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get reporter's profile for email details
    const { data: reporterProfile } = await supabase
      .from('user_profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single();

    const reporterName = reporterProfile?.display_name || reporterProfile?.email || 'Unknown User';
    const reporterEmail = reporterProfile?.email || 'Unknown Email';

    // Format content details for email
    let contentDetails = '';
    if (reportData.reportedContentType === 'tweet' && reportData.reportedContentId) {
      contentDetails = `Reported Tweet ID: ${reportData.reportedContentId}`;
    } else if (reportData.reportedContentType === 'pet_profile' && reportData.reportedContentId) {
      contentDetails = `Reported Pet Profile ID: ${reportData.reportedContentId}`;
    } else if (reportData.reportedContentType === 'user' && reportData.reportedUserName) {
      contentDetails = `Reported User: ${reportData.reportedUserName}`;
    } else if (reportData.reportedPetName) {
      contentDetails = `Reported Pet: ${reportData.reportedPetName}`;
    }

    const emailResponse = await resend.emails.send({
      from: "PawCult Moderation <onboarding@resend.dev>",
      to: ["canerezgiyeniyurt@gmail.com"],
      subject: `New Abuse Report - ${reportData.abuseType}`,
      html: `
        <h2>New Abuse Report Submitted</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Report Details</h3>
          <p><strong>Report ID:</strong> ${report.id}</p>
          <p><strong>Reporter:</strong> ${reporterName} (${reporterEmail})</p>
          <p><strong>Content Type:</strong> ${reportData.reportedContentType}</p>
          <p><strong>Abuse Type:</strong> ${reportData.abuseType}</p>
          <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3>Content Information</h3>
          <p>${contentDetails}</p>
        </div>
        
        ${reportData.description ? `
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0dcaf0;">
            <h3>Additional Details</h3>
            <p>${reportData.description.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This report was automatically generated from the PawCult abuse reporting system.
          Please review and take appropriate action as necessary.
        </p>
      `,
    });

    console.log("Abuse report submitted and email sent:", { reportId: report.id, emailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      reportId: report.id,
      message: "Report submitted successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in submit-abuse-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);